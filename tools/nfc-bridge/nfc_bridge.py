#!/usr/bin/env python3
"""
Pont NFC LANDELA : lit les cartes posées sur un lecteur PC/SC (ex. ACR122U)
et envoie chaque badge à l'API (POST /api/nfc/scan), comme le fera le
terminal de pointage.

    python nfc_bridge.py                 # pointage réel avec le lecteur
    python nfc_bridge.py --verifier      # vérifie lecteur, serveur et clé
    python nfc_bridge.py --uid 048B5772FA1D90   # simule un badge, sans lecteur

Aucune dépendance à installer : bibliothèque standard Python 3.9+.
Sous Windows, le lecteur est piloté par winscard.dll. Ailleurs (Linux,
Raspberry Pi), installer pyscard (pip install pyscard).

Le comportement (réponses de l'API -> signal et message) est décrit dans le
README : c'est la référence à reproduire dans le terminal de pointage.
"""
from __future__ import annotations

import argparse
import configparser
import json
import os
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path

DOSSIER = Path(__file__).resolve().parent

# --- Commandes envoyées au lecteur (APDU) -----------------------------------
LIRE_UID = bytes([0xFF, 0xCA, 0x00, 0x00, 0x00])
# ACR122U : voyant + buzzer. FF 00 40 <voyants> 04 <T1> <T2> <répétitions> <buzzer>
SIGNAUX = {
    'vert': bytes([0xFF, 0x00, 0x40, 0xA8, 0x04, 0x02, 0x02, 0x01, 0x01]),    # vert, 1 bip
    'orange': bytes([0xFF, 0x00, 0x40, 0xFC, 0x04, 0x02, 0x02, 0x02, 0x01]),  # orange, 2 bips
    'rouge': bytes([0xFF, 0x00, 0x40, 0x54, 0x04, 0x02, 0x02, 0x03, 0x01]),   # rouge, 3 bips
}
# ACR122U : bip automatique à la détection d'une carte (coupé pendant que le pont
# tourne, car chaque résultat a son propre signal ; rétabli à l'arrêt).
BIP_DETECTION_OFF = bytes([0xFF, 0x00, 0x52, 0x00, 0x00])
BIP_DETECTION_ON = bytes([0xFF, 0x00, 0x52, 0xFF, 0x00])
VERSION_LECTEUR = bytes([0xFF, 0x00, 0x48, 0x00, 0x00])


# --- Lecteurs ----------------------------------------------------------------
class LecteurIndisponible(Exception):
    pass


class LecteurWinscard:
    """Accès direct à winscard.dll (Windows), sans dépendance."""

    def __init__(self):
        import ctypes
        from ctypes import wintypes

        self.ct = ctypes
        self.wt = wintypes
        try:
            w = ctypes.WinDLL('winscard')
        except OSError as exc:
            raise LecteurIndisponible(f'winscard.dll introuvable : {exc}') from exc
        H = ctypes.c_size_t  # SCARDCONTEXT / SCARDHANDLE (ULONG_PTR)
        self.H = H

        class IoRequest(ctypes.Structure):
            _fields_ = [('dwProtocol', wintypes.DWORD), ('cbPciLength', wintypes.DWORD)]

        self.IoRequest = IoRequest
        w.SCardEstablishContext.argtypes = [wintypes.DWORD, ctypes.c_void_p, ctypes.c_void_p, ctypes.POINTER(H)]
        w.SCardEstablishContext.restype = wintypes.LONG
        w.SCardReleaseContext.argtypes = [H]
        w.SCardReleaseContext.restype = wintypes.LONG
        w.SCardListReadersW.argtypes = [H, wintypes.LPCWSTR, ctypes.c_wchar_p, ctypes.POINTER(wintypes.DWORD)]
        w.SCardListReadersW.restype = wintypes.LONG
        w.SCardConnectW.argtypes = [H, wintypes.LPCWSTR, wintypes.DWORD, wintypes.DWORD,
                                    ctypes.POINTER(H), ctypes.POINTER(wintypes.DWORD)]
        w.SCardConnectW.restype = wintypes.LONG
        w.SCardDisconnect.argtypes = [H, wintypes.DWORD]
        w.SCardDisconnect.restype = wintypes.LONG
        w.SCardTransmit.argtypes = [H, ctypes.POINTER(IoRequest), ctypes.c_char_p, wintypes.DWORD,
                                    ctypes.c_void_p, ctypes.c_char_p, ctypes.POINTER(wintypes.DWORD)]
        w.SCardTransmit.restype = wintypes.LONG
        w.SCardControl.argtypes = [H, wintypes.DWORD, ctypes.c_char_p, wintypes.DWORD,
                                   ctypes.c_char_p, wintypes.DWORD, ctypes.POINTER(wintypes.DWORD)]
        w.SCardControl.restype = wintypes.LONG
        self.w = w

        self.ctx = H()
        rc = w.SCardEstablishContext(2, None, None, ctypes.byref(self.ctx))  # 2 = SCARD_SCOPE_SYSTEM
        if rc != 0:
            raise LecteurIndisponible(f'Service « Carte à puce » indisponible (code 0x{rc & 0xFFFFFFFF:08X}).')

    def lecteurs(self) -> list[str]:
        n = self.wt.DWORD(0)
        if self.w.SCardListReadersW(self.ctx, None, None, self.ct.byref(n)) != 0 or n.value == 0:
            return []
        buf = self.ct.create_unicode_buffer(n.value)
        if self.w.SCardListReadersW(self.ctx, None, buf, self.ct.byref(n)) != 0:
            return []
        return [r for r in buf[:n.value].split('\0') if r]

    def connecter(self, lecteur: str):
        carte, proto = self.H(), self.wt.DWORD(0)
        # 2 = partagé, 3 = T0 | T1
        if self.w.SCardConnectW(self.ctx, lecteur, 2, 3, self.ct.byref(carte), self.ct.byref(proto)) != 0:
            return None
        return (carte, proto.value)

    def transmettre(self, connexion, apdu: bytes):
        carte, proto = connexion
        pci = self.IoRequest(proto, self.ct.sizeof(self.IoRequest))
        recu = self.ct.create_string_buffer(258)
        n = self.wt.DWORD(len(recu))
        if self.w.SCardTransmit(carte, self.ct.byref(pci), apdu, len(apdu), None, recu, self.ct.byref(n)) != 0:
            return None
        rep = recu.raw[:n.value]
        return (rep[:-2], rep[-2], rep[-1]) if len(rep) >= 2 else None

    def deconnecter(self, connexion):
        self.w.SCardDisconnect(connexion[0], 0)

    def commande_directe(self, lecteur: str, apdu: bytes) -> bool:
        """Commande au lecteur lui-même (voyant, buzzer), sans carte posée."""
        lien, proto = self.H(), self.wt.DWORD(0)
        if self.w.SCardConnectW(self.ctx, lecteur, 3, 0, self.ct.byref(lien), self.ct.byref(proto)) != 0:  # 3 = direct
            return False
        try:
            recu = self.ct.create_string_buffer(64)
            n = self.wt.DWORD(0)
            ioctl = (0x31 << 16) | (3500 << 2)  # IOCTL_CCID_ESCAPE (Windows)
            rc = self.w.SCardControl(lien, ioctl, apdu, len(apdu), recu, len(recu), self.ct.byref(n))
            return rc == 0 and n.value > 0
        finally:
            self.w.SCardDisconnect(lien, 0)

    def fermer(self):
        self.w.SCardReleaseContext(self.ctx)


class LecteurPyscard:
    """Lecteur via pyscard (Linux, macOS, Raspberry Pi, ou Windows si installé)."""

    def __init__(self):
        try:
            from smartcard.System import readers
        except ImportError as exc:
            raise LecteurIndisponible('pyscard n’est pas installé (pip install pyscard).') from exc
        self._readers = readers

    def lecteurs(self) -> list[str]:
        try:
            return [str(r) for r in self._readers()]
        except Exception:
            return []

    def connecter(self, lecteur: str):
        try:
            r = next(r for r in self._readers() if str(r) == lecteur)
            conn = r.createConnection()
            conn.connect()
            return conn
        except Exception:
            return None

    def transmettre(self, conn, apdu: bytes):
        try:
            data, sw1, sw2 = conn.transmit(list(apdu))
            return bytes(data), sw1, sw2
        except Exception:
            return None

    def deconnecter(self, conn):
        try:
            conn.disconnect()
        except Exception:
            pass

    def commande_directe(self, lecteur: str, apdu: bytes) -> bool:
        try:
            from smartcard.scard import SCARD_CTL_CODE, SCARD_SHARE_DIRECT
            r = next(r for r in self._readers() if str(r) == lecteur)
            conn = r.createConnection()
            conn.connect(mode=SCARD_SHARE_DIRECT)
            try:
                code = 3500 if sys.platform == 'win32' else 1  # IOCTL_CCID_ESCAPE
                return bool(conn.control(SCARD_CTL_CODE(code), list(apdu)))
            finally:
                conn.disconnect()
        except Exception:
            return False

    def fermer(self):
        pass


def ouvrir_lecteur():
    try:
        return LecteurPyscard()
    except LecteurIndisponible:
        if sys.platform == 'win32':
            return LecteurWinscard()
        raise


def lire_uid(lecteur, connexion) -> str | None:
    rep = lecteur.transmettre(connexion, LIRE_UID)
    if not rep or (rep[1], rep[2]) != (0x90, 0x00) or not rep[0]:
        return None
    return rep[0].hex().upper()


# --- API ----------------------------------------------------------------------
def appeler(api: str, cle: str, methode: str, chemin: str, corps: dict | None, delai: float):
    """Renvoie (code HTTP ou None si serveur injoignable, JSON de réponse)."""
    donnees = json.dumps(corps).encode() if corps is not None else None
    req = urllib.request.Request(
        f'{api}{chemin}', data=donnees, method=methode,
        headers={'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': f'Bearer {cle}'},
    )
    try:
        with urllib.request.urlopen(req, timeout=delai) as r:
            return r.status, json.loads(r.read() or b'{}')
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read() or b'{}')
        except ValueError:
            return e.code, {}
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        return None, {'message': str(getattr(e, 'reason', e))}


def envoyer_scan(api, cle, uid, delai):
    # `status` est exigé par l'API actuelle ; le serveur le corrige en « retard »
    # après l'heure limite (paramètre late_after).
    return appeler(api, cle, 'POST', '/nfc/scan', {'uid': uid, 'status': 'present'}, delai)


def interpreter(code, data) -> tuple[str, str, str]:
    """Réponse de l'API -> (signal, titre, détail). Référence pour le terminal."""
    message = (data or {}).get('message') or ''
    if code in (200, 201):
        p = (data or {}).get('data') or {}
        qui = p.get('nom_eleve_snapshot') or 'Élève'
        if p.get('classe_snapshot'):
            qui += f" ({p['classe_snapshot']})"
        statut = p.get('statut_presence')
        if statut == 'present':
            return 'vert', 'À L’HEURE', qui
        if statut == 'retard':
            return 'orange', 'RETARD', qui
        if statut == 'absent':
            return 'rouge', 'ABSENT', qui
        return 'vert', 'ENREGISTRÉ', qui
    if code == 404:
        return 'rouge', 'CARTE INCONNUE', message or 'Carte inconnue ou désactivée.'
    if code == 409:
        return 'rouge', 'DÉJÀ ENREGISTRÉ', message or 'Déjà pointé aujourd’hui.'
    if code == 401:
        return 'rouge', 'CLÉ REFUSÉE', 'La clé d’accès est invalide ou expirée (voir config.ini).'
    if code == 422:
        erreurs = (data or {}).get('errors') or {}
        premier = next(iter(erreurs.values()), [message])
        return 'rouge', 'REQUÊTE REFUSÉE', (premier[0] if premier else message)
    if code is None:
        return 'rouge', 'SERVEUR INJOIGNABLE', message
    return 'rouge', f'ERREUR SERVEUR ({code})', message


# --- Affichage ----------------------------------------------------------------
COULEURS = {'vert': '\033[92m', 'orange': '\033[93m', 'rouge': '\033[91m'}
FIN = '\033[0m'


def afficher(uid, signal, titre, detail, couleur: bool):
    heure = datetime.now().strftime('%H:%M:%S')
    etiquette = f'{titre:<20}'
    if couleur:
        etiquette = f'{COULEURS.get(signal, "")}{etiquette}{FIN}'
    print(f'[{heure}] {uid:<20} {etiquette} {detail}', flush=True)


def signaler(lecteur, nom, signal):
    """Voyant + bips sur le lecteur. Passe par une commande directe : marche
    même si la carte a déjà été retirée pendant l'appel à l'API."""
    apdu = SIGNAUX.get(signal)
    if apdu:
        lecteur.commande_directe(nom, apdu)


# --- Configuration ------------------------------------------------------------
def charger_config(args):
    cfg = configparser.ConfigParser()
    chemin = Path(args.config) if args.config else DOSSIER / 'config.ini'
    if chemin.exists():
        cfg.read(chemin, encoding='utf-8')
    api = (args.api or os.environ.get('LANDELA_API_URL') or cfg.get('api', 'url', fallback='')
           or 'http://localhost:8000/api').rstrip('/')
    cle = os.environ.get('LANDELA_CLE') or cfg.get('api', 'cle', fallback='')
    delai = cfg.getfloat('api', 'delai', fallback=5.0)
    return api, cle.strip(), delai, chemin


# --- Modes --------------------------------------------------------------------
def mode_verifier(api, cle, delai):
    ok = True
    try:
        lecteur = ouvrir_lecteur()
        noms = lecteur.lecteurs()
        if noms:
            print(f'Lecteur      : OK ({noms[0]})')
            conn = lecteur.connecter(noms[0])
            if conn:
                print(f'Carte posée  : {lire_uid(lecteur, conn) or "illisible"}')
                lecteur.deconnecter(conn)
        else:
            print('Lecteur      : aucun lecteur branché')
            ok = False
        lecteur.fermer()
    except LecteurIndisponible as exc:
        print(f'Lecteur      : indisponible ({exc})')
        ok = False

    code, data = appeler(api, cle, 'GET', '/nfc/cards', None, delai)
    if code == 200:
        print(f'Serveur      : OK ({api})')
        print(f'Clé d’accès  : OK, {len(data.get("data") or [])} carte(s) enregistrée(s)')
    elif code == 401:
        print(f'Serveur      : OK ({api})')
        print('Clé d’accès  : REFUSÉE, vérifiez config.ini')
        ok = False
    elif code is None:
        print(f'Serveur      : INJOIGNABLE ({api}) : {data.get("message")}')
        ok = False
    else:
        print(f'Serveur      : réponse inattendue {code}')
        ok = False
    return 0 if ok else 1


def mode_simuler(api, cle, delai, uids, couleur):
    for brut in uids:
        uid = brut.replace(':', '').replace(' ', '').replace('-', '').upper()
        code, data = envoyer_scan(api, cle, uid, delai)
        afficher(uid, *interpreter(code, data), couleur=couleur)
    return 0


def mode_lecteur(api, cle, delai, couleur, signaux=True, intervalle=0.25):
    lecteur = ouvrir_lecteur()
    noms = lecteur.lecteurs()
    if not noms:
        print('Aucun lecteur NFC branché.')
        return 1
    nom = noms[0]
    print(f'Lecteur : {nom}')
    print(f'Serveur : {api}')
    print('Posez une carte (Ctrl+C pour arrêter)…', flush=True)

    # Signaux possibles seulement si le lecteur accepte les commandes directes.
    signaux = signaux and lecteur.commande_directe(nom, VERSION_LECTEUR)
    if signaux:
        lecteur.commande_directe(nom, BIP_DETECTION_OFF)
    else:
        print('(Voyant et bips du lecteur non pilotés : seul l’écran affiche le résultat.)')

    dernier = None
    try:
        while True:
            conn = lecteur.connecter(nom)
            uid = lire_uid(lecteur, conn) if conn else None
            if conn:
                lecteur.deconnecter(conn)
            if uid and uid != dernier:
                code, data = envoyer_scan(api, cle, uid, delai)
                signal, titre, detail = interpreter(code, data)
                afficher(uid, signal, titre, detail, couleur)
                if signaux:
                    signaler(lecteur, nom, signal)
            # Une carte laissée sur le lecteur n'est envoyée qu'une fois.
            dernier = uid
            time.sleep(intervalle)
    except KeyboardInterrupt:
        print('\nArrêt du pont NFC.')
    finally:
        if signaux:
            lecteur.commande_directe(nom, BIP_DETECTION_ON)  # rend au lecteur son bip habituel
        lecteur.fermer()
    return 0


def main(argv=None):
    p = argparse.ArgumentParser(description='Pont NFC LANDELA : lecteur de cartes -> POST /api/nfc/scan')
    p.add_argument('--verifier', action='store_true', help='vérifie le lecteur, le serveur et la clé, puis quitte')
    p.add_argument('--uid', nargs='+', metavar='UID', help='simule un ou plusieurs badges sans lecteur')
    p.add_argument('--api', help='adresse de l’API (défaut : config.ini, puis http://localhost:8000/api)')
    p.add_argument('--config', help='fichier de configuration (défaut : config.ini à côté du script)')
    p.add_argument('--sans-signal', action='store_true', help='ne pilote ni le voyant ni le buzzer du lecteur')
    args = p.parse_args(argv)

    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass
    couleur = sys.stdout.isatty()
    if couleur and sys.platform == 'win32':
        os.system('')  # active les couleurs ANSI dans la console Windows

    api, cle, delai, chemin = charger_config(args)
    if not cle:
        print(f'Clé d’accès manquante : renseignez « cle » dans {chemin} (voir README).')
        return 2

    try:
        if args.verifier:
            return mode_verifier(api, cle, delai)
        if args.uid:
            return mode_simuler(api, cle, delai, args.uid, couleur)
        return mode_lecteur(api, cle, delai, couleur, signaux=not args.sans_signal)
    except LecteurIndisponible as exc:
        print(f'Lecteur indisponible : {exc}')
        return 1


if __name__ == '__main__':
    sys.exit(main())
