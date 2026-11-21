"""'Where next' strategy notes, imported by build_notes.py.

Each entry is keyed by the moves where a variation begins. A line uses the entry with
the longest key that its moves start with (so specific variations override general
ones), and falls back to the family's plan card if none match.

aim:   what the line is trying to do
White: where White takes the game from here
Black: where Black takes the game from here
"""


def S(aim, white, black):
    return {"aim": aim, "White": white, "Black": black}


STRATEGY = {}

# ------------------------------------------------------------------ Ruy Lopez

STRATEGY["ruylopez"] = {
    "e4 e5 Nf3 Nc6 Bb5": S(
        "Black avoids the main lines with an offbeat defence, usually at the cost of time or space.",
        "Castle, then c3 and d4: a broad centre punishes passive setups.",
        "Keep e5 firm, finish development, and avoid falling further behind."),
    "e4 e5 Nf3 Nc6 Bb5 Nf6": S(
        "The Berlin: Black hits e4 and steers for a solid structure or the Berlin endgame.",
        "Castle and Re1 or d4; in the endgame, use the kingside majority and Black's awkward king.",
        "Trade queens when allowed, lean on the bishop pair, and keep the structure compact."),
    "e4 e5 Nf3 Nc6 Bb5 Bc5": S(
        "The Classical Defense puts the bishop on its best diagonal before White's centre arrives.",
        "Castle, then c3 and d4 to gain time on the c5 bishop.",
        "...Nf6 or ...Nge7, keep the bishop active, and hit back with ...d5."),
    "e4 e5 Nf3 Nc6 Bb5 f5": S(
        "The Schliemann: Black attacks e4 at once to open the f-file.",
        "Nc3 and d3 or d4: keep control and open lines against Black's king.",
        "Develop fast, take on e4, and use the f-file before White consolidates."),
    "e4 e5 Nf3 Nc6 Bb5 d6": S(
        "The Old Steinitz holds e5 with a pawn: solid, but cramped.",
        "d4 and Nc3 for space, then increase the pressure on e5.",
        "...Bd7 and ...Nf6; give up e5 with ...exd4 only when forced, then play actively."),
    "e4 e5 Nf3 Nc6 Bb5 Nd4": S(
        "Bird's Defense trades knights to ease the pressure on e5, leaving a pawn on d4.",
        "Nxd4 exd4, castle, and attack the d4 pawn with c3.",
        "Develop quickly and use the d4 pawn to cramp White."),
    "e4 e5 Nf3 Nc6 Bb5 a6 Ba4": S(
        "White keeps the pressure on c6 and e5 while Black chooses a set-up.",
        "Castle, then c3 and d4 for a broad centre.",
        "Pick a plan: ...Nf6 for the main lines, ...d6 to hold e5, or ...b5 to gain space."),
    "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6": S(
        "The main Ruy: Black develops and hits e4, White castles and fights for d4.",
        "O-O, Re1, c3 and d4; the bishop on b3 keeps pressure on f7 and d5.",
        "...Be7 or ...Nxe4, then ...b5 and ...d6, aiming for ...d5 or ...c5 breaks."),
    "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7": S(
        "The Closed Ruy: a slow fight over e5 and d4 with long manoeuvres.",
        "Re1, Bb3, c3, h3 and d4; Nbd2-f1-g3 for the kingside and a4 against the queenside.",
        "...b5, ...d6, ...O-O, then ...Na5 and ...c5, or ...Re8 and ...Bf8 to hold e5."),
    "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 O-O c3 d5": S(
        "The Marshall: Black gives a pawn for a fierce, long-lasting kingside attack.",
        "Take the pawn, defend with d4, Re1 and g3, and return material if it kills the attack.",
        "Pile on with ...Bd6, ...Qh4 and ...Bg4; the attack has to keep moving."),
    "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 O-O c3 d6 h3 Nb8": S(
        "The Breyer reroutes the knight to d7 so it supports e5 and frees the c-pawn.",
        "Nbd2-f1-g3, Bc2, and a4 or a d5 clamp.",
        "...Nbd7, ...Bb7, ...c5 and ...Re8: solid and flexible."),
    "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Qe2": S(
        "The Worrall Attack: the queen backs up e4 so the rook can go to d1.",
        "c3, d4 and Rd1 for central pressure.",
        "...b5, ...d6 and ...O-O, then ...Bg4 or ...Na5 against the b3 bishop."),
    "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 Qe2": S(
        "The Wormald Attack: the queen backs up e4 so the rook can go to d1.",
        "c3, d4 and Rd1 for central pressure.",
        "...b5, ...Be7 and ...d6, then ...Bg4 to pin and pressure d4."),
    "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Nxe4": S(
        "The Open Ruy: Black takes e4 for active pieces, accepting a looser structure.",
        "d4 and Re1 to win the pawn back, then target the c5 and e6 squares and the d5 pawn.",
        "...b5, ...d5 and ...Be6 for active pieces; keep the e4 knight well supported."),
    "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O b5 Bb3 Bb7": S(
        "The Arkhangelsk: the bishop on b7 hits e4 and the long diagonal.",
        "c3 and d4, or Re1 and a4 to question the queenside.",
        "...Bc5 or ...Be7, then pressure e4 and d4 with active pieces."),
    "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Bc5": S(
        "The Møller: the bishop goes to c5 early, inviting c3 and d4.",
        "c3 and d4 with tempo on the bishop.",
        "...b5 and ...d6, keeping the bishop active on the a7-g1 diagonal."),
    "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O d6": S(
        "Black holds e5 with ...d6 after castling, letting Bxc6 and d4 test the structure.",
        "Bxc6+ and d4 to open the centre against the doubled pawns.",
        "Recapture towards the centre and use the bishop pair once lines open."),
    "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 d3": S(
        "White protects e4 quietly and avoids sharp theory for a slow manoeuvring game.",
        "c3, Nbd2-f1-g3 and a gradual kingside build-up.",
        "...b5, ...d6 and ...Be7, then ...d5 when it's ready."),
    "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 d6": S(
        "The Modern Steinitz holds e5 with ...d6, ready to break the pin with ...b5.",
        "c3, d4 and O-O for a big centre; Bxc6 when it damages Black's pawns.",
        "...Bd7 and ...Nge7, or the sharp ...f5 (Siesta), keeping e5 firm."),
    "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 b5": S(
        "Black kicks the bishop early, gaining space but committing the queenside.",
        "Bb3, then a4 to hit the b5 pawn, or c3 and d4.",
        "...Bb7, ...Bc5 or ...Na5 to trade off the b3 bishop."),
    "e4 e5 Nf3 Nc6 Bb5 a6 Bxc6 dxc6": S(
        "The Exchange Ruy: White damages Black's pawns, aiming for a favourable endgame.",
        "d4 and trade pieces; the 4-v-3 kingside majority can make a passed pawn.",
        "Use the bishop pair and open lines; keep pieces on and avoid simple endgames."),
}

# ------------------------------------------------------------------ Italian Game

STRATEGY["italiangame"] = {
    "e4 e5 Nf3 Nc6 Bc4 Bc5": S(
        "Both bishops aim at the enemy f-pawn; the fight is over d4.",
        "c3 and d4 for a big centre, or d3 and a slow build-up with Re1 and Nbd2-f1-g3.",
        "...Nf6, ...d6 and ...O-O; hit back with ...d5 when White's centre isn't ready."),
    "e4 e5 Nf3 Nc6 Bc4 Bc5 b4": S(
        "The Evans Gambit: a pawn for time, so c3 and d4 build the centre with tempo.",
        "c3, d4, O-O and pressure on f7 and the open centre.",
        "Keep the pawn only if it's safe; returning it to finish development is often best."),
    "e4 e5 Nf3 Nc6 Bc4 Nf6": S(
        "The Two Knights: Black counterattacks e4, inviting sharp play.",
        "Ng5 to hit f7, d4 for open play, or d3 for a calm game.",
        "Meet Ng5 with ...d5 and keep developing; gambit lines give Black quick activity."),
    "e4 e5 Nf3 Nc6 Bc4 Be7": S(
        "The Hungarian Defense: passive but solid, avoiding every sharp line.",
        "d4 for space, then d5 to cramp Black.",
        "...d6, ...Nf6 and ...O-O; look for ...c6 or ...f5 to free the game."),
}

# ------------------------------------------------------------------ King's Gambit

STRATEGY["kingsgambit"] = {
    "e4 e5 f4 exf4": S(
        "White trades the f-pawn for a strong centre and fast development.",
        "d4, Bc4, O-O and the f-file; regain f4 when convenient.",
        "Hold the pawn with ...g5, or return it with ...d5 for free development."),
    "e4 e5 f4 exf4 Nf3": S(
        "White plays for d4 and a lead in development; Black tries to keep the pawn.",
        "d4, Bc4 and O-O, then open the f-file against f7.",
        "...g5 or ...d6 to keep the pawn, or ...d5 to give it back and develop."),
    "e4 e5 f4 exf4 Bc4": S(
        "The Bishop's Gambit lets the king go to f1 in return for fast development.",
        "Nc3, d4 and Nf3 with tempo on Black's queen.",
        "...Nf6, ...d5 or ...Qh4+ for quick counterplay."),
    "e4 e5 f4 d5": S(
        "Black strikes the centre instead of taking the gambit pawn.",
        "Take on d5 and keep the extra pawn, developing safely.",
        "...e4 or ...c6 to gain activity against White's loosened king."),
    "e4 e5 f4 Bc5": S(
        "Black declines, using the bishop to stop White castling short.",
        "Nf3, c3 and d4 to blunt the bishop.",
        "...d6, ...Nf6 and quick development."),
}

# ------------------------------------------------------------------ Vienna

STRATEGY["viennagame"] = {
    "e4 e5 Nc3 Nf6 f4": S(
        "The Vienna Gambit opens the f-file and gains space with e5.",
        "Push e5, then Nf3, d4 and play down the f-file.",
        "...d5 at once to open the centre, using the knight on e4."),
    "e4 e5 Nc3 Nf6 Bc4": S(
        "White aims at f7 and keeps f4 in reserve.",
        "d3, f4 or Nge2: open the f-file against Black's king.",
        "...Nc6 and ...Bc5, or the sharp ...Nxe4 fork trick."),
    "e4 e5 Nc3 Nf6 Bc4 Nxe4": S(
        "The Frankenstein-Dracula: wild tactics where Black can give up a rook for activity.",
        "Qh5 and the attack on f7; grab material only if it's safe.",
        "...Nd6 and ...g6, then trap or chase White's queen and stranded knight."),
    "e4 e5 Nc3 Nf6 g3": S(
        "A quiet fianchetto aiming at d5 and the long diagonal.",
        "Bg2, Nge2, O-O and a slow build-up with d3 and f4.",
        "...d5 to free the game, then ...Bd6 and ...O-O."),
    "e4 e5 Nc3 Nc6": S(
        "Symmetrical development; White chooses between f4 and a fianchetto.",
        "f4 for gambit play, or g3 and Bg2 for a slow game.",
        "...Bc5 and ...Nf6, keeping e5 secure."),
    "e4 e5 Nc3 Nc6 f4": S(
        "A wild gambit: White gives material for an attack on f7.",
        "h4, Ng5 and d4, opening lines on Black's king.",
        "Keep the material and consolidate with ...d6 and ...Bg7."),
    "e4 e5 Nc3 Bc5": S(
        "Black eyes f2 and keeps the setup flexible.",
        "Nf3 and d4 to open the centre while ahead in development.",
        "...d6, ...Nf6 and solid development."),
}

# ------------------------------------------------------------------ Queen's Gambit

STRATEGY["queensgambit"] = {
    "d4 d5 c4 e6 Nc3 Nf6": S(
        "A classical centre fight: White presses d5 and the queenside, Black stays solid.",
        "Bg5, e3, Rc1 and Bd3; in Carlsbad structures push b4-b5 (the minority attack).",
        "...Be7, ...O-O and ...Nbd7, then free the game with ...c5 or ...e5."),
    "d4 d5 c4 e6 Nc3 Nf6 cxd5": S(
        "The Exchange: a Carlsbad structure, White's minority attack against Black's kingside chances.",
        "Bd3, Qc2, Rb1 and b4-b5 to leave Black a weak c-pawn.",
        "...Ne4 and ...f5 for kingside play; meet b5 with ...c6 exchanges."),
    "d4 d5 c4 e6 Nc3 Nf6 Nf3 c5": S(
        "The Semi-Tarrasch: Black hits d4 and accepts an open centre.",
        "cxd5 and e4 for a big centre, then d5 or a kingside attack.",
        "Trade pieces and attack the centre with ...cxd4 and ...Nc6."),
    "d4 d5 c4 e6 Nc3 c5": S(
        "The Tarrasch: an isolated d-pawn in exchange for active pieces.",
        "g3 and Bg2 to hit d5; trade pieces and blockade on d4.",
        "Rooks to the c- and e-files, ...Be6, and ...d4 at the right moment."),
    "d4 d5 c4 dxc4": S(
        "The Accepted: Black takes c4 to gain time; White builds a centre and wins it back.",
        "e3 or e4, Bxc4 and O-O; aim for d5 or a kingside attack.",
        "...c5, ...a6 and ...b5, with free development through ...Nc6 and ...Bb7."),
    "d4 d5 c4 e5": S(
        "The Albin: a pawn for a cramping d4 pawn and quick piece play.",
        "g3, Bg2 and Nbd2; return the pawn if needed and target d4.",
        "...Nc6, ...Be6 and often ...O-O-O with a kingside pawn push."),
    "d4 d5 c4 Nc6": S(
        "The Chigorin: Black trades pawns for active pieces.",
        "Nf3 and cxd5 to win the centre and the bishop pair.",
        "...Bg4xf3 and ...e5 to fight with pieces."),
    "d4 d5 c4 Bf5": S(
        "The Baltic: Black develops the light bishop before ...e6.",
        "Nc3 and Qb3 to hit b7 and d5.",
        "...e6 and ...c6, accepting a queen trade on b3."),
}

# ------------------------------------------------------------------ Catalan

STRATEGY["catalan"] = {
    "d4 Nf6 c4 e6 g3 d5 Bg2": S(
        "The Closed Catalan: Black keeps d5 solid, White builds slow pressure.",
        "Nf3, O-O, Qc2 and e4 to open the centre for the g2 bishop.",
        "...Be7, ...O-O, ...c6 and ...Nbd7, then ...b6 and ...Bb7."),
    "d4 Nf6 c4 e6 g3 d5 Bg2 dxc4": S(
        "The Open Catalan: Black takes c4; White wins it back with lasting pressure.",
        "Nf3, O-O and Qc2 or Qa4+ to regain c4, then press the long diagonal.",
        "...a6 and ...b5 or ...Nc6 to hold or return the pawn, then free the c8 bishop."),
    "d4 Nf6 c4 e6 g3 Bb4+": S(
        "The Bogo-Catalan: Black swaps or misplaces White's dark-squared bishop.",
        "Bd2, Bg2 and Nf3, keeping the long-diagonal pressure.",
        "...Be7 or ...Bxd2+, then ...d5 and ...c6."),
    "d4 Nf6 c4 e6 g3 c5": S(
        "Black heads for Benoni-style play against the fianchetto.",
        "d5, Nc3 and use the central majority.",
        "...exd5, ...d6, ...g6, then queenside play with ...a6 and ...b5."),
    "d4 Nf6 c4 e6 Nf3 d5 g3": S(
        "A Catalan reached through Nf3, after Black has committed to ...d5.",
        "Bg2, O-O and Qc2, regaining c4 if Black takes it.",
        "...Be7 and ...dxc4, then ...a6, ...b5 and ...Bb7."),
}

# ------------------------------------------------------------------ London

STRATEGY["london"] = {
    "d4 Nf6 Bf4 c5 e3 Qb6": S(
        "Black attacks b2 straight away, testing the London's weak spot.",
        "Nc3 (offering b2) or Qc1 and Nd2: development matters more than the pawn.",
        "Take on b2 only if it's safe; otherwise develop with ...Nc6 and ...d5."),
    "d4 Nf6 Bf4 e6": S(
        "Black heads for a Queen's Indian setup aimed at e4.",
        "e3, Nf3, h3, Bd3, c3 and Nbd2, then e4 or Ne5.",
        "...b6, ...Bb7, ...Be7 and ...c5, fighting for e4."),
    "d4 Nf6 Bf4 g6": S(
        "Black sets up a Grünfeld or King's Indian against the London.",
        "Nc3 and Nb5 ideas against c7, or e3, Nf3 and h3.",
        "...d5 or ...d6, ...Bg7 and ...O-O, then ...c5."),
    "d4 Nf6 Nf3 g6 Bf4": S(
        "A King's Indian setup against the London.",
        "e3, h3, Be2, O-O and c3; then e4 or a queenside push.",
        "...d6, ...Nbd7 and ...e5, or ...c5 with ...Qb6."),
    "d4 d5 Bf4 Bf5": S(
        "Black mirrors White's bishop development.",
        "e3, c4 and Qb3 to hit b7.",
        "...e6, ...Bb4+ and ...Nc6 for active development."),
    "d4 d5 Bf4 Nf6 e3 c6": S(
        "A Slav setup: solid and level.",
        "Nf3, Bd3 or c4, aiming for e4.",
        "...Bf5, ...e6 and ...Nbd7, then ...Be7 or ...Bd6."),
    "d4 d5 Bf4 Nf6 e3 e6": S(
        "Black plays a Queen's Gambit-style setup with ...c5.",
        "Nf3, c3, Nbd2 and Bd3, aiming for Ne5 and a kingside attack.",
        "...c5, ...Nc6 and ...Bd6 to trade off the f4 bishop."),
    "d4 d5 Bf4 c5": S(
        "Black hits d4 and b2 at once.",
        "e3, c3 and Qb3 to neutralise ...Qb6.",
        "...Nc6, ...Qb6 and ...c4 for queenside space."),
    "d4 d5 Nc3": S(
        "The Jobava London: aggressive, with Nb5 ideas against c7.",
        "Bf4, Nb5, e3, and sometimes O-O-O with a kingside push.",
        "...Na6 to cover c7, then ...c6 or ...c5 and ...Bd6."),
    "d4 f5 Bf4": S(
        "The London against the Dutch.",
        "e3, Nf3, Bd3 and Nbd2, then e4 or a kingside attack.",
        "...b6 and ...Bb7 to control e4, then ...Be7 and ...O-O."),
}

# ------------------------------------------------------------------ English

STRATEGY["englishopening"] = {
    "c4 e5": S(
        "A reversed Sicilian: White plays the Sicilian with an extra tempo.",
        "Nc3, g3 and Bg2, then queenside expansion with Rb1 and b4.",
        "...Nc6 and ...Nf6, then ...d5 or a ...f5 kingside push."),
    "c4 e5 Nc3 Nc6 g3": S(
        "The Closed English: White plays on the queenside, Black on the kingside.",
        "Bg2, d3, Rb1 and b4-b5.",
        "...g6, ...Bg7, ...d6, ...f5 and a kingside attack."),
    "c4 e5 Nc3 Nf6 Nf3 Nc6": S(
        "The Four Knights English: symmetrical development.",
        "g3, Bg2 and O-O, then d4 to open the centre.",
        "...Bb4 and ...d5 or ...e4 for activity."),
    "c4 e5 Nc3 Nf6 g3": S(
        "After ...d5 and cxd5 it's a Dragon with colours reversed.",
        "Bg2, Nf3, O-O, then a3 and b4 on the queenside.",
        "...Nb6, ...Be7, ...O-O and control of the centre."),
    "c4 e5 Nc3 Bb4": S(
        "Black gives the bishop for c3 to double White's pawns.",
        "Bg2 and open the position for the bishop pair.",
        "...d6, ...Nc6 and ...f5 to clamp the centre."),
    "c4 e5 Nc3 d6": S(
        "The Botvinnik setup: Black builds a broad kingside centre.",
        "g3, Bg2, then e4 or Rb1 and b4.",
        "...f5, ...Nf6 and ...g6 for kingside space."),
    "c4 c5": S(
        "The Symmetrical English: a slow fight over d4 and d5.",
        "Nc3, g3 and Bg2, then d4, or b3 and Bb2.",
        "...Nc6, ...g6 and ...Bg7, or ...Nf6 and ...d5."),
    "c4 Nf6 Nc3 d5": S(
        "An Anglo-Grünfeld: Black plays a Grünfeld against the English.",
        "g3 and Bg2, pressing the long diagonal.",
        "...Nb6, ...Bg7 and ...Nc6, then ...e5."),
    "c4 Nf6 Nc3 e6 e4": S(
        "The Mikenas: White grabs the centre with e4 and e5.",
        "e5 and d4 for space, then attack any advanced Black pawn.",
        "...d5 and ...d4 for activity, then hit the centre."),
    "c4 Nf6 Nc3 g6": S(
        "Black sets up a King's Indian against the English.",
        "g3, Bg2, Rb1 and b4 for queenside play.",
        "...O-O, ...d6, ...e5 and ...Nc6, then ...f5."),
    "c4 c6": S(
        "Black prepares ...d5 with a Slav or Caro-Kann structure.",
        "Nf3, e3, b3 and Bb2, or e4 for open play.",
        "...d5, ...Nf6 and ...e6 for a solid setup."),
    "c4 c6 e4": S(
        "White switches to an open game with e4; after the exchanges it's a Panov-style fight.",
        "Develop fast with Nc3 and Nf3, and play against Black's queenside pawns.",
        "...Nf6 and ...Nxd5, then ...g6 and ...Bg7 or ...Nc6 for active pieces."),
    "c4 e6": S(
        "A Queen's Gambit-style setup.",
        "Nf3, g3, Bg2, O-O, then b3 and Bb2.",
        "...d5, ...Nf6, ...Be7 and ...c5."),
    "c4 f5": S(
        "A Dutch setup against the English.",
        "g3, Bg2, Nc3 and d4, then the e4 break.",
        "...Nf6, ...g6, ...Bg7, ...d6 and ...e5."),
}

# ------------------------------------------------------------------ Sicilian

STRATEGY["sicilian"] = {
    "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3": S(
        "The Open Sicilian: White's space and development against Black's c-file and central majority.",
        "Choose an attack: Be3 and O-O-O, Bg5 and f4, or Be2 and f4.",
        "Counterattack on the queenside with ...a6, ...b5 and rooks on the c-file."),
    "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6": S(
        "The Najdorf: ...a6 controls b5 and keeps ...e5, ...e6 and ...b5 all available.",
        "Be3, f3, Qd2 and O-O-O (English Attack), or Bg5 and f4.",
        "...e5 or ...e6, then ...b5 and ...Bb7; attack on the c-file and queenside."),
    "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6": S(
        "The Dragon: the g7 bishop rakes the long diagonal towards White's queenside.",
        "Be3, f3, Qd2 and O-O-O, then h4-h5 and Bh6 to swap the Dragon bishop.",
        "...Nc6, ...O-O and ...Rc8, with ...Rxc3 sacrifices; race with ...a5 or ...b5."),
    "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 e6": S(
        "The Scheveningen: a small, flexible centre with pawns on e6 and d6.",
        "The Keres Attack with g4-g5, or Be2, O-O and f4.",
        "...a6, ...Qc7, ...Nc6 and ...b5; break with ...d5 or ...e5."),
    "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 Nc6": S(
        "The Classical: natural development, keeping every option open.",
        "Bg5 (Richter-Rauzer), Qd2 and O-O-O.",
        "...e6, ...a6, ...Bd7 and ...b5 against White's king."),
    "e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3 e5": S(
        "The Sveshnikov: Black accepts a hole on d5 for active pieces and the bishop pair.",
        "Bg5 and Nd5, then occupy d5 and target the backward d6 pawn.",
        "...b5, ...Bg7 or ...Be7, and ...f5 to break White's grip."),
    "e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 e5": S(
        "The Kalashnikov: Black kicks the knight, conceding d5 for activity.",
        "Nb5, N1c3 and Nd5; c4 to clamp the centre.",
        "...a6, ...b5 and ...f5 with active pieces."),
    "e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 g6": S(
        "The Accelerated Dragon: fianchetto without ...d6, keeping ...d5 in one move.",
        "c4 for the Maróczy bind, or Nc3, Be3 and Bc4.",
        "...Bg7, ...Nf6 and ...O-O, then break with ...d5 or ...b5."),
    "e4 c5 Nf3 e6 d4 cxd4 Nxd4 Nc6": S(
        "The Taimanov: flexible, with ...Qc7 and ...a6 keeping the structure open.",
        "Nc3, Be3, Qd2 and O-O-O, or Be2 and O-O.",
        "...a6, ...Qc7, ...Nf6, then ...Bb4 or ...b5."),
    "e4 c5 Nf3 e6 d4 cxd4 Nxd4 a6": S(
        "The Kan: ...a6 covers b5 and the queen goes to c7.",
        "Bd3, O-O and c4 for a Maróczy-style bind.",
        "...Qc7 and ...Nf6, then ...b5, or ...d6 and ...g6."),
    "e4 c5 Nf3 e6 d4 cxd4 Nxd4 Nf6": S(
        "The Four Knights Sicilian: fast development, often with ...Bb4.",
        "Ndb5 or Nxc6, and e5 to kick the knight.",
        "...Bb4 and ...d5 to free the game."),
    "e4 c5 Nf3 d6 Bb5+": S(
        "The Moscow: White trades bishops and builds a calm centre.",
        "c3 and d4, Re1 and a slow central build-up.",
        "...Nc6, ...Nf6, ...e6 and ...d5 for a solid centre."),
    "e4 c5 Nf3 Nc6 Bb5": S(
        "The Rossolimo: White pressures c6 and may double Black's pawns.",
        "O-O, Re1, then Bxc6 with c3 and d4.",
        "...g6, ...Bg7 and ...e5, using the bishop pair."),
    "e4 c5 c3": S(
        "The Alapin: White aims for a classical pawn centre.",
        "d4 and cxd4 for a full centre, then simple development.",
        "...Nf6 or ...d5 to hit the centre before it settles."),
    "e4 c5 Nc3": S(
        "The Closed Sicilian: slow play aimed at the kingside.",
        "g3, Bg2, d3, f4 and f5, or Bc4 in the Grand Prix.",
        "...Nc6, ...g6, ...Bg7 and ...d6, then ...e5 or ...Rb8 and ...b5."),
    "e4 c5 d4 cxd4 c3": S(
        "The Smith-Morra: a pawn for development and open files.",
        "Nxc3, Nf3, Bc4, O-O, Qe2 and Rd1: pressure on d6 and f7.",
        "Develop solidly with ...Nc6, ...e6, ...d6 and ...Be7; return the pawn if needed."),
}

# ------------------------------------------------------------------ French

STRATEGY["french"] = {
    "e4 e6 d4 d5 Nc3 Bb4": S(
        "The Winawer: after e5 and a3, White gets the bishop pair and doubled c-pawns.",
        "Qg4 against g7, or Nf3, a4 and play for the bishops.",
        "...c5, ...Ne7 and ...Qc7 or ...Qa5: attack d4 and the doubled pawns."),
    "e4 e6 d4 d5 Nc3 Nf6": S(
        "The Classical: Black pressures e4; White chooses e5 or Bg5.",
        "e5 and f4 for space, or Bg5 lines with play on the kingside.",
        "...c5, ...Nc6 and ...Qb6 against d4, or ...dxe4 after Bg5."),
    "e4 e6 d4 d5 Nc3 dxe4 Nxe4": S(
        "The Rubinstein: Black gives up the centre for solid, easy development.",
        "Nf3, Bd3, O-O and Qe2, then c3 and d5 or a kingside push.",
        "...Nd7, ...Ngf6 and ...Be7, then free the game with ...c5."),
    "e4 e6 d4 d5 Nd2": S(
        "The Tarrasch: White avoids pins on c3 and keeps c3 for a pawn.",
        "Ngf3, Bd3, O-O and c3; aim to isolate Black's d-pawn.",
        "...c5 for an isolated-pawn game, or ...Nf6, ...Nfd7 and ...f6."),
    "e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3": S(
        "The Advance: a locked centre where Black attacks d4 and White guards it.",
        "Bd3, O-O and a kingside attack, keeping d4 supported.",
        "...Qb6, ...Bd7 and ...f6 against e5, or ...Nge7-f5 to hit d4."),
    "e4 e6 d4 d5 exd5 exd5": S(
        "The Exchange: a symmetrical, open structure.",
        "Quick development, then c4 or Bd3 and kingside play.",
        "...Bd6, ...Nf6 and ...O-O; the c8 bishop is free now."),
    "e4 e6 d3": S(
        "A King's Indian Attack against the French.",
        "Nd2, Ngf3, g3, Bg2, O-O, then e5 and a kingside attack.",
        "...d5, ...c5 and ...Nc6, then queenside expansion with ...b5."),
}

# ------------------------------------------------------------------ Caro-Kann

STRATEGY["carokann"] = {
    "e4 c6 d4 d5 Nc3 dxe4 Nxe4": S(
        "Black gives up the centre to develop freely; the bishop or a knight comes out next.",
        "Use the space: Nf3, Bd3 or Bc4, and O-O.",
        "...Bf5, ...Nd7 or ...Nf6, then ...e6 and ...c5."),
    "e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5": S(
        "The Classical: the bishop develops with tempo, White uses extra space.",
        "Ng3 and h4-h5 to push the bishop back, then Bd3 and O-O-O.",
        "...Bg6, ...h6, ...Nd7, ...e6 and ...Ngf6; castle when it's safe."),
    "e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nd7": S(
        "The Karpov: ...Ngf6 next without allowing doubled pawns.",
        "Ng5 or Nf3 and Bd3, playing for a space edge.",
        "...Ngf6, ...e6 and ...c5: solid and level."),
    "e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nf6": S(
        "Black allows doubled pawns in return for open lines.",
        "c3, Bd3 and Ne2, then target the damaged pawns.",
        "...Bd6 or ...Bf5, castle, and use the open e- or g-file."),
    "e4 c6 d4 d5 e5": S(
        "The Advance: White gains space; Black's bishop must get out before ...e6.",
        "Nf3, Be2, O-O and c4, or h4 to harass the bishop.",
        "...Bf5, ...e6, ...c5 and ...Nc6 against d4."),
    "e4 c6 d4 d5 exd5 cxd5": S(
        "The Exchange: a symmetrical structure; White looks to the kingside.",
        "Bd3, c3, Bf4 and Qb3 against b7.",
        "...Nc6, ...Nf6 and ...Bg4, then queenside play with ...b5."),
    "e4 c6 d4 d5 exd5 cxd5 c4": S(
        "The Panov: an isolated-pawn fight where White attacks and Black blockades.",
        "Nc3, Nf3 and Bg5, then a kingside attack using the d4 pawn.",
        "...Nf6, ...e6 and ...Be7, blockade on d5 and trade pieces."),
    "e4 c6 d4 d5 f3": S(
        "The Fantasy: White supports e4 with a pawn to keep the full centre.",
        "Nc3, Be3 and Qd2, or e5 for space.",
        "...e6 or ...dxe4 and ...e5 to strike the centre."),
    "e4 c6 Nc3 d5 Nf3": S(
        "The Two Knights: quick development, centre kept flexible.",
        "h3, recapture on f3 with the queen, then d4 and Bd3.",
        "...Bg4xf3, ...e6 and ...Nf6: solid with a sound centre."),
    "e4 c6 d3": S(
        "A King's Indian Attack against the Caro-Kann.",
        "Nd2, Ngf3, g3, Bg2, O-O and Re1.",
        "...d5, ...e5, ...Bd6 and ...O-O with a big centre."),
}

# ------------------------------------------------------------------ Pirc

STRATEGY["pirc"] = {
    "e4 d6 d4 Nf6 Nc3 g6 f4": S(
        "The Austrian Attack: White grabs space and threatens e5.",
        "Nf3, Bd3, O-O, then e5 or f5 with an attack.",
        "...Bg7, ...O-O, then ...c5 or ...Na6 to strike the centre."),
    "e4 d6 d4 Nf6 Nc3 g6 Be3": S(
        "White plans Qd2 and Bh6 with a kingside attack.",
        "Qd2, f3, Bh6 and h4-h5.",
        "...c6, ...b5 and ...Nbd7 for queenside counterplay."),
    "e4 d6 d4 Nf6 Nc3 g6 Be3 Ng4": S(
        "Black hits the bishop at once to gain the bishop pair or time.",
        "Bg5 and h3, or keep the bishop with Bg3.",
        "...h6, ...g5 and ...Bg7, playing on the dark squares."),
    "e4 d6 d4 Nf6 Nc3 g6 Nf3": S(
        "The Classical: solid development, White keeps a modest space edge.",
        "Be2, O-O, h3, then a4 or Re1.",
        "...Bg7, ...O-O, ...c6 or ...Nc6, then ...e5."),
    "e4 d6 d4 Nf6 Nc3 g6 Bg5": S(
        "The Byrne: White harasses the knight and prepares Qd2.",
        "Qd2 and f3 or Nf3, keeping Bh6 ideas.",
        "...c6, ...b5 and ...e5 to strike back."),
    "e4 d6 d4 Nf6 Nc3 g6 g3": S(
        "A fianchetto against the Pirc.",
        "Bg2, Nge2, O-O and h3.",
        "...Bg7, ...O-O, ...e5, ...c6 and ...Nbd7."),
    "e4 d6 d4 Nf6 Bd3": S(
        "White avoids Nc3 and keeps c3 for a pawn.",
        "c3 and Nf3, then a solid centre.",
        "...e5 and ...d5 to equalise in the centre."),
    "e4 d6 d4 Nf6 f3": S(
        "White supports e4 with f3, heading for a Sämisch-style setup.",
        "Be3, Qd2 and c4 for a space-grabbing bind.",
        "...e5, ...Be7 and ...c6 to challenge the centre."),
}

# ------------------------------------------------------------------ Modern

STRATEGY["modern"] = {
    "e4 g6 d4 Bg7 g3": S(
        "A quiet fianchetto against the Modern.",
        "Bg2, Ne2, O-O, then c3 or c4.",
        "...d6, ...Nf6 and ...O-O, then ...e5 or ...c5."),
    "e4 g6 d4 Bg7 Bg5": S(
        "White eyes e7 early, provoking ...h6 or ...c5.",
        "Qd2 and Nc3, with O-O-O ideas.",
        "...c5, or ...h6 and ...d6, hitting d4."),
    "e4 g6 d4 Bg7 c3": S(
        "White supports d4 with c3 and plans f4 for a broad centre.",
        "f4, Bd3 and Nf3.",
        "...d6, ...Nf6, ...O-O, then ...c5 or ...e5."),
    "e4 g6 d4 Bg7 Nc3 d6 Be3": S(
        "White plans Qd2 and a kingside attack.",
        "Qd2, f3, then O-O-O or h4-h5.",
        "...a6, ...b5 and ...Nd7 for queenside play."),
    "e4 g6 d4 Bg7 Nc3 d6 f4": S(
        "The Austrian: a big centre, threatening e5.",
        "Nf3, Bd3 and e5 for space.",
        "...a6, ...b5 and ...Bb7 to hit e4."),
    "e4 g6 d4 Bg7 Nc3 c6": S(
        "The Gurgenidze: Black aims for ...d5 and a light-square setup.",
        "f4 and e5 to lock the centre.",
        "...d5, ...h5 and ...Bg4: a solid light-square fortress."),
    "e4 g6 d4 Bg7 Nc3 d6 Nf3": S(
        "Calm development that often turns into a Pirc.",
        "Be2, O-O and h3.",
        "...Nf6, ...O-O, then ...c6 or ...Nc6."),
    "e4 g6 d4 Bg7 Nf3": S(
        "White develops calmly, keeping a solid centre.",
        "Be2 or c3, O-O and a modest space edge.",
        "...d6 and ...Nf6, or ...c5 and ...Qa5 (Pterodactyl)."),
    "e4 g6 d4 Bg7 c4": S(
        "White grabs space with c4 for a bind.",
        "Nc3 and Be3, keeping the bind.",
        "...d6, ...Nc6 and ...e5, or ...c5 Benoni-style."),
    "e4 g6 d4 Bg7 Bc4": S(
        "White aims the bishop at f7.",
        "Qe2 and Nf3, then e5.",
        "...d6, ...Nf6, ...O-O and ...Bg4."),
    "e4 g6 d4 Bg7 f4": S(
        "Black hits the big centre at once with ...d5.",
        "e5 for space.",
        "...c5 or ...Nh6-f5 against d4."),
    "e4 g6 d4 d6": S(
        "The Hippopotamus: small steps, then counterpunches.",
        "Develop naturally and expand, without over-committing.",
        "...a6, ...b6, ...Bb7, ...Nd7 and ...e6, waiting for the right break."),
}

# ------------------------------------------------------------------ Alekhine

STRATEGY["alekhine"] = {
    "e4 Nf6 e5 Nd5 d4 d6": S(
        "Black hits e5 at once; White decides how to support it.",
        "Nf3 and Be2 for solidity, or c4 and f4 for maximum space.",
        "...dxe5 or ...Bg4, then ...e6 and ...c5 against the centre."),
    "e4 Nf6 e5 Nd5 d4 d6 Nf3": S(
        "The Modern: White supports e5 with a piece rather than more pawns.",
        "Be2, O-O and c4, keeping e5.",
        "...Bg4, ...e6, ...Be7, then ...dxe5."),
    "e4 Nf6 e5 Nd5 d4 d6 c4": S(
        "White grabs space with c4, with f4 next in the Four Pawns Attack.",
        "f4 and Nf3, or exd6 for an open game.",
        "...dxe5 with ...Nc6 or ...g6, hitting the centre."),
    "e4 Nf6 e5 Nd5 d4 d6 Bc4": S(
        "The Balogh: White aims at f7 with Bc4-b3.",
        "Qh5 or Nf3 for an attack.",
        "...Nb6 and ...dxe5 with ...e6."),
    "e4 Nf6 e5 Nd5 c4": S(
        "The Chase: White chases the knight early.",
        "c5 and Bc4 or Nc3, using the space.",
        "...Nb6-d5, then ...d6 and ...e6."),
    "e4 Nf6 Nc3": S(
        "White avoids the main lines.",
        "exd5 or e5 with quiet development.",
        "...d5, then ...c5 or ...Nb6."),
}

# ------------------------------------------------------------------ Scandinavian

STRATEGY["scandinavian"] = {
    "e4 d5 exd5 Qxd5 Nc3 Qa5": S(
        "The queen on a5 pins the c3 knight and stays out of harm's way.",
        "d4, Nf3, Bc4, Bd2 and O-O.",
        "...Nf6, ...c6, ...Bf5 and ...e6; keep the queen safe."),
    "e4 d5 exd5 Qxd5 Nc3 Qd6": S(
        "The queen on d6 eyes the centre and b4.",
        "d4, Nf3, then g3 or Ne5.",
        "...Nf6, ...a6 or ...c6, and ...Bg4."),
    "e4 d5 exd5 Qxd5 Nc3 Qd8": S(
        "A solid retreat home.",
        "d4, Nf3 and Bc4 for a space edge.",
        "...Nf6, ...Bg4, ...c6 and ...e6."),
    "e4 d5 exd5 Nf6": S(
        "Black recaptures later with the knight.",
        "d4 or c4, holding d5 for a while.",
        "...Nxd5 with quick development, or gambit with ...c6 or ...e6."),
    "e4 d5 exd5 Nf6 d4 Bg4": S(
        "The Portuguese Gambit: Black develops quickly.",
        "f3 and c4 to keep the pawn.",
        "...Bf5, ...e6 and fast development."),
    "e4 d5 exd5 Nf6 c4 e6": S(
        "The Icelandic Gambit: a pawn for open lines.",
        "Nf3, d4 and safe development.",
        "...Bxe6, ...Nc6 and ...Bb4+ for activity."),
    "e4 d5 exd5 Nf6 c4 c6": S(
        "Black offers a pawn for development.",
        "d4 and Nc3 to keep the centre.",
        "...cxd5, then ...Nc6 and ...e6."),
    "e4 d5 exd5 Nf6 Bb5+": S(
        "White disrupts Black's development with a check.",
        "Bc4 and try to keep the d5 pawn.",
        "...Bd7, ...Bg4 and win back d5."),
}

# ------------------------------------------------------------------ Petrov

STRATEGY["petrov"] = {
    "e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4": S(
        "The Classical Petrov: a symmetrical, very solid position.",
        "d4, Bd3, O-O and c4, or Nc3 with O-O-O.",
        "...d5, ...Be7, ...O-O and ...Nc6; keep the e4 knight supported."),
    "e4 e5 Nf3 Nf6 Nxe5 d6 Nxf7": S(
        "The Cochrane: a piece for two pawns and an exposed king.",
        "d4, Nc3 and Bc4, attacking the king.",
        "Consolidate with ...c5 or ...Be7, returning material if needed."),
    "e4 e5 Nf3 Nf6 d4": S(
        "The Steinitz Attack opens the centre.",
        "Bd3, Nxe5 and O-O.",
        "...d5 and ...Nd7, or ...exd4: solid."),
    "e4 e5 Nf3 Nf6 Nc3": S(
        "Three Knights: White develops before taking on e5.",
        "Nxe5 or Bb5.",
        "...Bb4 and ...O-O, or ...Nc6."),
    "e4 e5 Nf3 Nf6 Bc4": S(
        "White offers e4 for gambit play.",
        "Nc3, then d3 or d4.",
        "...Nxe4, then ...f6 or ...Qe7 for solidity."),
}

# ------------------------------------------------------------------ Philidor

STRATEGY["philidor"] = {
    "e4 e5 Nf3 d6 d4 Nf6 Nc3 Nbd7": S(
        "The Lion: Black holds e5 with pieces in a compact shell.",
        "Bc4, O-O, Re1 and a4 for space.",
        "...Be7, ...O-O, ...c6, then ...b6 or ...exd4 and ...Re8."),
    "e4 d6 d4 Nf6 Nc3 e5": S(
        "The Lion reached through a Pirc move order.",
        "Nf3, Bc4 and O-O, then Re1.",
        "...Nbd7, ...Be7, ...O-O and ...c6."),
    "e4 e5 Nf3 d6 d4 exd4": S(
        "The Exchange: Black gives up the centre for piece play.",
        "Nxd4, Nc3, Be3, Qd2 and O-O-O.",
        "...Nf6 and ...Be7, or ...g6 and ...Bg7, then ...O-O."),
    "e4 e5 Nf3 d6 d4 Nd7": S(
        "The Hanham: the knight supports e5.",
        "Bc4 and Ng5 against f7.",
        "...c6, then ...Nh6 or ...Be7: solid."),
    "e4 e5 Nf3 d6 d4 Nf6": S(
        "Black pressures e4 and keeps e5.",
        "Nc3, or dxe5 Nxe4 for open play.",
        "...Nbd7, or ...Nxe4 after dxe5."),
    "e4 e5 Nf3 d6 d4 f5": S(
        "The Philidor Countergambit: sharp play on the f-file.",
        "dxe5, Ng5 and e6.",
        "...d5 and ...Bc5 for activity."),
}

# ------------------------------------------------------------------ King's Indian

STRATEGY["kingsindian"] = {
    "d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5": S(
        "The Classical: Black hits the centre with ...e5; once it locks, each side attacks its own wing.",
        "Close with d5, then b4 and c5 for a queenside breakthrough on c7.",
        "...Nh5 or ...Ne8, then ...f5, ...f4 and ...g5 for a kingside storm."),
    "d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6": S(
        "The main line: ...Nc6 provokes d5, sending the knight to e7 for the kingside attack.",
        "After d5 Ne7, push b4, c5 and Nd2-c4 to break through.",
        "...Ne8 or ...Nd7, then ...f5, ...f4 and ...g5: a race against White's queenside play."),
    "d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 d5 a5": S(
        "The Petrosian: White closes early; ...a5 slows White's queenside expansion.",
        "Bg5 to pin, then b4 or c5 when ready.",
        "...Na6-c5 to hold the queenside, then ...f5."),
    "d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 f3": S(
        "The Sämisch: f3 supports e4 and prepares Be3, Qd2 and a kingside storm.",
        "Be3 and Qd2, often O-O-O with g4 and h4.",
        "Strike quickly with ...c5 or ...e5, or ...Nc6, ...a6 and ...b5."),
    "d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 f4": S(
        "The Four Pawns Attack: maximum space, which Black must undermine at once.",
        "e5 to drive the knight back and break Black's position open.",
        "...c5 and ...e6 to open lines against the over-extended pawns."),
    "d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Be2 O-O": S(
        "The Averbakh: Be2 and often Bg5 restrain ...e5 and pin down Black's kingside.",
        "Bg5 and Qd2 with h4 ideas; meet ...e5 or ...c5 with d5.",
        "...c5 or ...e5, often after ...h6 or ...Na6, with play on the dark squares."),
    "d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 h3": S(
        "The Makogonov: h3 stops ...Ng4 and ...Bg4 and prepares Be3 and g4.",
        "Be3 and g4 to clamp the kingside before ...f5.",
        "...e5 with ...Na6-c5, then ...f5 or ...c6."),
    "d4 Nf6 c4 g6 Nc3 Bg7 Nf3 d6 Bg5": S(
        "The Smyslov: Bg5 develops before e4, keeping the centre flexible.",
        "e3 and a solid centre.",
        "...c5, or ...h6 and ...e5 to free the game."),
    "d4 Nf6 c4 g6 Nf3 Bg7 g3": S(
        "The Fianchetto: White's g2 bishop makes Black's kingside attack much harder.",
        "Keep the centre solid and press on the queenside and long diagonal.",
        "Panno (...Nc6, ...a6, ...Rb8, ...b5) or Yugoslav ...c5: play on the queenside."),
    "d4 Nf6 Nf3 g6 Bf4": S(
        "White avoids theory with a London setup.",
        "e3, h3, Be2, O-O and c3, then e4 or a queenside push.",
        "...c5 and ...Qb6 against b2, or ...d6, ...Nbd7 and ...e5."),
}

# ------------------------------------------------------------------ Nimzo-Indian

STRATEGY["nimzoindian"] = {
    "d4 Nf6 c4 e6 Nc3 Bb4": S(
        "The Nimzo-Indian: Black pins c3 to fight for e4, ready to trade bishop for knight.",
        "Choose Qc2, e3 or a3; aim for the bishop pair and the centre.",
        "...O-O, ...d5 or ...c5, and ...b6; target doubled c-pawns if they appear."),
    "d4 Nf6 c4 e6 Nc3 Bb4 Qc2": S(
        "The Classical: White avoids doubled pawns, spending time with the queen.",
        "a3 to win the bishop pair, then e3 or Nf3.",
        "...O-O, then ...d5 or ...c5: develop fast while the queen is on c2."),
    "d4 Nf6 c4 e6 Nc3 Bb4 e3": S(
        "The Rubinstein: solid development with Bd3 and Nf3 or Ne2.",
        "Bd3, Nf3, O-O, then a3 to gain the bishop pair.",
        "...O-O and ...d5 or ...c5, or ...b6 and ...Bb7."),
    "d4 Nf6 c4 e6 Nc3 Bb4 a3": S(
        "The Sämisch: White takes the bishop pair, Black targets the doubled c-pawns.",
        "f3 and e4 for a big centre.",
        "...c5, ...d5, ...Nc6 and ...Na5 against c4."),
    "d4 Nf6 c4 e6 Nc3 Bb4 Bg5": S(
        "The Leningrad: White pins back.",
        "e3, Bd3 and d5.",
        "...h6, ...c5, ...d6 and ...e5."),
    "d4 Nf6 c4 e6 Nc3 Bb4 Nf3": S(
        "Flexible development, keeping g3 or Qb3 options.",
        "g3 and Bg2, or Qb3.",
        "...c5, ...O-O and ...d5."),
    "d4 Nf6 c4 e6 Nc3 Bb4 Qb3": S(
        "The Spielmann: the queen covers c3 to avoid doubled pawns.",
        "Nf3 and Bd2.",
        "...c5, ...Nc6 and ...Ne4 for active pieces."),
    "d4 Nf6 c4 e6 Nc3 Bb4 f3": S(
        "The Kmoch: White prepares e4 directly.",
        "a3 and e4 for a big centre.",
        "...d5 or ...c5, hitting the centre before it forms."),
    "d4 Nf6 c4 e6 Nc3 Bb4 g3": S(
        "The Romanishin: a Catalan-style fianchetto.",
        "Bg2, Nf3 and O-O.",
        "...O-O, ...d5 and ...dxc4."),
}

# ------------------------------------------------------------------ Queen's Indian

STRATEGY["queensindian"] = {
    "d4 Nf6 c4 e6 Nf3 b6": S(
        "The Queen's Indian: Black controls e4 from b7, solid and flexible.",
        "g3 and Bg2, or a3 and Nc3 to fight for e4.",
        "...Bb7 or ...Ba6, ...Be7 and ...O-O, then ...d5 or ...c5."),
    "d4 Nf6 c4 e6 Nf3 Bb4+": S(
        "The Bogo-Indian: a check to swap the dark-squared bishops.",
        "Bd2 or Nbd2, then g3 and Bg2.",
        "...Qe7 or ...a5, ...O-O, then ...d6 and ...e5."),
}

# ------------------------------------------------------------------ Grünfeld

STRATEGY["grunfeld"] = {
    "d4 Nf6 c4 g6 Nc3 d5 cxd5 Nxd5": S(
        "The Exchange: White's big centre against Black's pieces and ...c5.",
        "e4, then Nf3 or Bc4, Be3, O-O and Rc1; push d5 when possible.",
        "...Bg7, ...c5 and ...Nc6, with ...Qa5 or ...Bg4 to attack d4."),
    "d4 Nf6 c4 g6 Nc3 d5 Nf3": S(
        "White develops before deciding on the centre.",
        "Qb3 or e3 and Be2, then a solid centre.",
        "...Bg7, ...O-O and ...c5 to hit d4."),
    "d4 Nf6 c4 g6 Nc3 d5 Nf3 Bg7 Qb3": S(
        "The Russian: White pressures d5 and grabs the centre.",
        "Qxc4, e4, Be2 and Be3.",
        "...O-O and ...a6, ...Bg4 or ...Na6, hitting the centre."),
    "d4 Nf6 c4 g6 Nc3 d5 Bf4": S(
        "White pressures c7 and avoids the main lines.",
        "e3, Rc1 and Nf3.",
        "...Bg7, ...c5 and ...Qa5."),
    "d4 Nf6 c4 g6 Nc3 d5 Bg5": S(
        "Bg5 invites ...Ne4.",
        "Bh4, e3 and cxd5.",
        "...Ne4, ...dxc4 and ...Be6."),
    "d4 Nf6 c4 g6 Nc3 d5 Qb3": S(
        "An early queen: pressure on d5.",
        "Qxc4, e4 and Be2.",
        "...dxc4, ...Bg7, ...O-O and ...Nc6."),
    "d4 Nf6 c4 g6 g3 d5": S(
        "Black hits the centre before White's bishop settles.",
        "Bg2, Nf3, O-O and Nc3.",
        "...Nxd5, ...Nb6, ...Nc6 and ...e5."),
}

# ------------------------------------------------------------------ Slav

STRATEGY["slav"] = {
    "d4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4": S(
        "The Main Line: Black takes c4, aiming for ...Bf5 and ...e6.",
        "a4 to stop ...b5, then e3 and Bxc4, or Ne5.",
        "...Bf5, ...e6, ...Bb4 and ...O-O."),
    "d4 d5 c4 c6 Nf3 Nf6 Nc3 e6": S(
        "The Semi-Slav: a rock-solid centre with ...dxc4 ideas.",
        "e3 (Meran) or Bg5 (Botvinnik and Moscow).",
        "...Nbd7, ...dxc4, ...b5 and ...c5."),
    "d4 d5 c4 c6 Nf3 Nf6 Nc3 a6": S(
        "The Chebanenko: Black prepares ...b5.",
        "e3, b3 or c5 to stop ...b5.",
        "...b5 and ...Bg4 with queenside play."),
    "d4 d5 c4 c6 Nf3 Nf6 e3": S(
        "A quiet line: White protects c4.",
        "Nc3, Bd3, O-O, Qc2 and e4.",
        "...Bf5 or ...Bg4, ...e6 and ...Nbd7."),
    "d4 d5 c4 c6 cxd5 cxd5": S(
        "The Exchange Slav: a symmetrical structure.",
        "Nc3, Bf4, e3 and Rc1.",
        "...Nc6 and ...Bf5, equalising with care."),
    "d4 d5 c4 c6 Nc3 dxc4": S(
        "Black takes c4 and White builds the centre with e4.",
        "e4 and Nf3, regaining c4.",
        "...e5 or ...b5 to hold on."),
}

# ------------------------------------------------------------------ Benoni

STRATEGY["benoni"] = {
    "d4 Nf6 c4 c5 d5 e6": S(
        "The Modern Benoni: Black's queenside majority and open e-file against White's central majority.",
        "Nc3, e4 and Be2 or Bd3, then the e5 break or f4.",
        "...exd5, ...d6, ...g6, ...Bg7, then ...a6 and ...b5."),
    "d4 Nf6 c4 c5 d5 b5": S(
        "The Benko: Black gives a pawn for open a- and b-files.",
        "Keep the pawn, develop, and blunt the pressure.",
        "...Bxa6, ...g6 and ...Bg7, with rooks on a8 and b8."),
    "d4 Nf6 c4 c5 d5 e5": S(
        "The Czech Benoni: a closed centre and slow manoeuvring.",
        "e4, Nc3, Be2, then h3 or g4.",
        "...d6, ...Be7, ...O-O and ...Ne8, then ...f5."),
    "d4 c5 d5 e5": S(
        "The Old Benoni: a closed centre and slow manoeuvring.",
        "e4, Nc3 and Nf3, then play on the queenside.",
        "...d6 and ...Be7, then ...f5."),
}

# ------------------------------------------------------------------ Dutch

STRATEGY["dutch"] = {
    "d4 f5": S(
        "The Dutch: Black fights for e4 with the f-pawn and aims at the kingside.",
        "Fianchetto, c4 and Nc3, then e4 to break Black's grip.",
        "...Nf6 and ...e6 or ...g6; hold e4 and attack with ...Qe8-h5."),
    "d4 f5 c4 Nf6 g3 e6 Bg2 d5": S(
        "The Stonewall: Black locks e4 with pawns, leaving a hole on e5.",
        "Nf3, O-O, b3 and Ba3 to swap dark bishops, then Ne5.",
        "...Bd6, ...O-O, ...Qe7 and ...Ne4, with a kingside attack."),
    "d4 f5 c4 Nf6 g3 e6 Bg2 Be7": S(
        "The Classical Dutch: a flexible ...d6 setup.",
        "Nf3, O-O, Nc3 and e4.",
        "...O-O, ...d6 and ...Qe8-h5."),
    "d4 f5 g3 Nf6 Bg2 g6": S(
        "The Leningrad: a King's Indian-style setup with f5.",
        "Nf3, O-O, c4, Nc3 and d5.",
        "...Bg7, ...O-O, ...d6, then ...e5 or ...Qe8."),
    "d4 f5 Bg5": S(
        "The Hopton: White provokes ...h6 and ...g5.",
        "e3, Bg3 and h4 against the advanced pawns.",
        "...h6, ...g5, ...Nf6 and solid development."),
    "d4 f5 Nc3": S(
        "White prepares e4.",
        "Bg5 and e4.",
        "...d5 and ...Nf6 to stop e4."),
    "d4 f5 e4": S(
        "The Staunton Gambit: a pawn for development.",
        "Nc3, Bg5, then f3 or d5.",
        "...Nf6 and ...Nc6, keeping the pawn."),
    "d4 f5 Nf3": S(
        "A London-style setup against the Dutch.",
        "Bf4, e3, Bd3 and Nbd2.",
        "...e6, ...b6 and ...Bb7 for control of e4."),
}
