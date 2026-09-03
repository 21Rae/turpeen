// Script to parse, enrich and generate PostgreSQL INSERT statements for Turpeen Cosmetics products
const fs = require('fs');
const path = require('path');

const rawProductList = `
9PM BLACK AFNAN
9PM ELIXIR AFNAN
9PM REBEL AFNAN
A.M GLOW BODY MILK LOTION
ACTION GLOW OIL CARROT
ACTION GLOW OIL TURMERIC
ACTION WHITE BODY OIL
ACWELL CLEANSING TONER 300ML
ACWELL TONER 150ML
ADVANCED KOREAN ACTIVE FAIR FACE CREAM
ADVANCED KOREAN BRIGHT&DEWY LOTION
ADVANCED KOREAN BRIGHT&MOISTURE LOTION
ADVANCED KOREAN BRIGHT&SMOOTH LOTION
ADVANCED KOREAN BRIGHTENING OIL 280ML
ADVANCED KOREAN BRIGHTER FACE CREAM
ADVANCED KOREAN LIGHTENING&BARRIER LOTIO
ADVANCED KOREAN SKIN ACNE FACEWASH
ADVANCED KOREAN SKIN MULBERRY FACE WASH
AL TAG MOROCCAN BLACK SOAP 600G
ALADA SOAP
ALL OVER BODY BUTTER LOTION GLUTHATHIONE
ALL OVER BODY BUTTER LOTION LACTIC ACID
ALL OVER BODY BUTTER LOTION SALICYLIC
ALL OVER BODY BUTTER LOTION VIT-C
ALL OVER BODY BUTTER SCRUB GLUTHATHIONE
ALL OVER BODY BUTTER SCRUB LACTIC ACID
ALL OVER BODY BUTTER SCRUB SALICYLIC
ALOE VERA 260ML
ALPHA ARBUTIN COLLAGEN SOAP
ALPHA BODY LOTION 340G
AMETHYST LATTAFA
ANEEZA GOLD BEAUTY FACE CREAM 20GM
ANGHAM LATTAFA 100ML
ANIMATE VITAMIN E CAPSULES
ANUA CERAMIDE3+PANTHENOL MOISTURIZER
ANUA NIACINAMIDE SERUM
AQUA MISSHA SUNSCREEN
AQUA RICH BRIGHTENING BODY OIL
AQUARICH  HYDRATE + PROTECT BATH 1000ML
AQUARICH BRIGHT + GLOW BATH 1000M
ASAD LATTAFA BLACK
ASAD LATTAFA BLUE
ASAD LATTAFA BROWN
ASANTEE PAPAYA&HONEY SOAP
ASIAN SECRET BODY OIL
AVENTOS BLUE FOR HIM 100ML
AXIS-Y DARK SPOT CORRECTING SERUM
AZELAIC ACID GEL 20% 15G
BABY FACE CREAM PINK
BABY ORAGANICS BABY WIPES
BAKKARAT ROUGE 25ML
BALANCE GLYCOLIC ACID TONER
BALANCE SALICYLIC ACID+ZINC TONER
BEAUTIFUL TENDER BODY OIL 300ML
BEAUTIFUL TENDER LOTION 500ML
BEAUTY FORMULA GLOWING SERUM 30ML
BEAUTY FORMULAR VITAMIN C WIPES 25PCS
BEAUTY FORMULARS APRICOT WIPES 25PCS
BEAUTY FORMULAS VITAMIN C FACE WASH
BEAUTY FORMULAS VITAMIN C MOISTURIZER
BEAUTY FORMULAS VITAMIN C SCRUB
BERRIES WEEKEND 100ML
BIO OIL 125ML
BIO OIL 60ML
BIORE UV SUNSCREEN
BLEMISH KIDS LOTION PINK 400ML
BODY SPRAY
BOOSTER WHITE INJECTION LOTION 500ML
BOOTS GLYCERIN & ROSEWATER
BRIGHT UP PINK LIPS BALM
CANTU SHEA BUTTER LEAVE-IN CONDITIONER
CAVIAR GLOW BODY LOTION
CERAVE  SA SMOOTHING CREAM 340G
CERAVE CREAM TO FOAM CLEANSER 236ML
CERAVE HYDRATING CLEANSER 236ML
CERAVE HYDRATING CLEANSER 473ML
CERAVE MOISTURISING CREAM 454G
CERAVE MOISTURIZING CREAM BAUME 177ML
CERAVE MOISTURIZING LOTION 473ML
CERAVE SA SMOOTHING CLEANSER 236ML
CLEAN & CLEAR MORNING BURST CLEANSER
CLEAR & SMOOTH LIGHTENING SPA SCRUB
CLEAR ESSENCE MEDICATED SOAP 133.2G
CLEAR NATURE GOLD BATH 1000ML
CLEAR NATURE ORIGINAL BATH 1000ML
CLEAR NATURE PAPAYA ARBUTIN BATH 1000ML
CLIN-CAP CREAM 30GM
CLIN-CAP GEL 30GM
CLOUD CANDY 100ML
CLOWTHERAPY BAKUCHIOL 6% BODY WH 1000ML
COLLAGEN SNAIL FACE CREAM
CONFETTI BODY MIST
COSMO ACTIVE SPORT ROLL ON
COSMO ALPHA ARBUTIN SERUM
COSMO FRESH BREEZE ROLL ON
COSMO GLOW WHITE FACE WASH 125ML
COSMO NIACINAMIDE SERUM
COSMO PINK BLOSSOM ROLL ON
COSMO PURE ELEGANCE ROLL ON
COSMO RETINOL  FACE SERUM 30ML
COSMO VITAMIN-C FACE SERUM 30ML
COSRX ADVANCED SNAIL 96 MUCIN ESSENCE
COSRX LOW GOOD MORNING GEL CLEANSER 150M
COSRX SNAIL CREAM 100G
CREIGHTONS SALICYLIC ACID TONER
CUSSON BABY OIL PINK
DEAR BODY DREAMY GLOW MIST 250ML
DERMA PLUS EXFOLIATING BODY WASH 1000ML
DERMA PLUS LOTION
DERMA PLUS VIT-C SOAP
DISAAR COCOA BODY OIL GEL
DISAAR COCOA BUTTER BODY OIL 100ML
DISAAR MOISTURIZING GLYCERIN OIL 200ML
DISAAR PAPAYA BODY OIL 100ML
DISAAR SNAIL MUCIN ESSENCE
DISAAR SNAIL MUCIN FACE CREAM
DISAAR TURMERIC BODY OIL 100ML
DISAAR VITAMIC C BODY OIL 100ML
DOVE BEAUTY CREAM SOAP 360G
DOVE BODY SCRUB LAVENDER&COCONUT MILK
DOVE BODY SCRUB MACADAMIA & RICE MILK
DOVE BODY SCRUB POMEGRANATE SEED
DOVE DEODORANT SPRAY APPLE
DOVE DEODORANT SPRAY ORIGINAL
DOVE DEODORANT SPRAY RESTORING RITUAL
DOVE GLOWING BODY WASH 500ML
DOVE LOTION AWAKENING RITUAL
DOVE LOTION DEEP CARE COMPLEX
DOVE LOTION GLOWING CARE
DOVE LOTION INVIGORATING CARE
DOVE LOTION RESTORING RITUAL
DOVE PAMPERING BODY WASH 750ML
DOVE PAMPERING CARE BAR SOAP
DOVE PAMPERING CARE LOTION 400ML
DOVE PINK SOAP 360G
DOVE PURELY PAMPERING WASH 500ML
DOVE SENSITIVE SKIN SOAP 360G
DR ALTHEA 345 RELIEF CREAM
DR JAMES BODY OIL
DR MEINAIER BODY SCRUB 650G
DR MEINAIER ORGANIC OIL 24K GOLD
DR MEINAIER ORGANIC OIL ALMOND
DR RASHEL MOISTURE SUNCREAM
DR RASHEL VITAMIN C EYE SERUM
DR RASHEL VIT-C FACE SERUM
DR RASHEL WHITE SKIN FADE SPOT SERUM
DR RASHEL WHITENING DAY CREAM
DR TEALS BODY LOTION AVOCADO
DR TEALS BODY LOTION LAVENDER
DR TEALS BODY LOTION SPEARMINT
DR TEALS BODY LOTION VITAMIN C
DR TEALS BODY WASH VITAMIN C
DR TEALS MOISTURIZING OIL LEMON
DR TEALS MOISTURIZING OIL NOURISH
DR TEALS MOISTURIZING OIL SHEABUTTER
DR TEALS VIT-C SCRUB 538G
DR.MEINAIER ALOE VERA SNAIL GEL 250ML
DRIP CARROT SOAP
DRIP PAPAYA SOAP
DRIP VITAMIN C/KOJIC SOAP
DUDU OSUN SOAP
E45 MOISTURISING LOTION 500ML
EASY GLOW BODY LOTION
EASY GLOW LOTION BLACK 538ML
ECLAIR AFFAIR 100ML
ECLAIRE LATTAFA 100ML
EDEN APRICOT SCRUB CUP 454G
EDEN APRICOT SCRUB S/S 227G
EDEN EXTRA WHITENING BODY SCRUB 500G
EGG SOAP
ELLEN BEAUTY CARROT LOTION
ELLEN BEAUTY EXCLUSIVE LOTION
ELLEN BEAUTY HALF CAST LOTION
ELLEN BEAUTY SUPER MAXITONE LOTION
ELLEN BEAUTY VITAMIN C LOTION
ELLLEN BEAUTY PAPAYA EXTRACT LOTION
EOS  FRESH + COZY LOTION 473ML
EOS STRAWBERRY DREAM LOTION 473ML
EOS VANILLA CASHMERE LOTION 473ML
ESTELIN B5 CERAMIDE SERUM
ESTELIN CERAMIDE TONER
ESTELIN HYALURONIC ACID TONER
ESTELIN NIACINAMIDE SERUM
ESTELIN NIACINAMIDE TONER 400ML
ESTELIN RETINOL SERUM
ESTELIN RETINOL TONER
ESTELIN RICE COLLAGEN SERUM
ESTELIN SUNSCREEN
ESTELIN SUNSCREEN SPF 100  100G
ESTELIN TURMERIC VITAMIN C SERUM
ESTELIN VITAMIN C PLUS SERUM
ESTELIN VITAMIN C TONER
EXTRACT WHITENING SOAP
F&W SO WHITE  500ML
F&W SO WHITE VITAMIN C 500ML
FACAFACTS HYALURONIC ACID SERUM
FACE FACTS BODY SCRUB WATERMELON 400G
FACEFACT BLEMISH CLEANSER 400ML
FACEFACT HYDRATING CLEANSER 200ML
FACEFACT HYDRATING CLEANSER 400ML
FACEFACT OIL CONTROL TONER 200ML
FACEFACT WONDER CREAM
FACEFACTS  FOAMING CLEANSER 400ML
FACEFACTS  NIACINAMIDE SERUM 30ML
FACEFACTS BODY SCRUBS BROWN SUGAR 400G
FACEFACTS BRIGHT&CLEAR FACE CREAM
FACEFACTS BRIGHTEN VIT C SERUM
FACEFACTS CERAMIDE MOISTURIZER
FACEFACTS CERAMIDE REPAIRING CREAM
FACEFACTS CEREMIDE SERUM
FACEFACTS COLLAGEN LOTION 400ML
FACEFACTS COLLAGEN SERUM 30ML
FACEFACTS DARK CIRCLES EYE PATCHES
FACEFACTS GLYCOLIC ACID BODY CLEANSER
FACEFACTS HYALURONIC LOTION 400ML 503141
FACEFACTS KOJIC ACID LOTION 400ML
FACEFACTS LACTIC ACID BODY CLEANSER
FACEFACTS LACTIC ACID SERUM
FACEFACTS MOISTURISING CREAM 454ML
FACEFACTS RETINOL SERUM 30ML
FACEFACTS SALICYLIC ACID BODY CLEANSER
FACEFACTS SALICYLIC ACID SERUM 30ML
FACEFACTS SOOTHE+GLOW NIACINAMIDE SERUM
FACEFACTS SOOTHING FACIAL TONER 200ML
FACEFACTS WRINKLE CARE EYE PATCHES
FAIR & WHITE EXCLUSIVE VITAMIN C SERUM
FAIR & WHITE GOLD ULTIMATE SERUM
FAIR & WHITE SO WHITE SERUM
FAIR CHILD LOTION 400ML PINK
FAIR&WHITE GOLD LOTION 350ML
FASTER WHITE CARROTE LOTION 500ML
FASTER WHITE GOLD LOTION 500ML
FASTER WHITE SNAIL LOTION
FEM FRESH WASH 250ML
FILIPINO ALPHA ARBUTIN BATH 1000ML
FILIPINO ALPHA ARBUTIN SOAP
FILIPINO CARROT&KOJIC SOAP
FILIPINO CAVIAR & TUMERIC BATH 1000ML
FILIPINO CAVIAR & TURMERIC FACE CREAM
FILIPINO GLUTHATHIONE&FENNEL SOAP
FILIPINO HALFCAST FACE CREAM 60G
FILIPINO LOTION ALMOND&GIGA
FILIPINO LOTION ALPHA ARBUTIN
FILIPINO LOTION CARROT&KOJIC
FILIPINO LOTION GLUTHATHIONE&FENNEL SEED
FILIPINO LOTION HALFCAST
FILIPINO LOTION RETINOL A
FILIPINO LOTION VITAMIN C
FILIPINO RETINOL-A FACE CREAM 60G
FILIPINO VITAMIN C BATH 1000ML
FILIPINO VITAMIN C FACE CREAM 60G
FIX DARK SPOT FACE CREAM
FRUIT OF WOKALI ALOE VERA SCRUB 600G
FRUIT OF WOKALI APRICOT SCRUB 600G
FRUIT OF WOKALI PINK DREAM SCRUB  600G
FRUIT OF WOKALI RASPBERRY SCRUB 600G
FRUIT SOAP
FUNBACT-A TRIPLE ACTION CREAM 30G
G MOON EXTRA BEAUTY GLOW LOTION CARROT
G MOON EXTRA BEAUTY GLOW LOTION TURMERIC
GARNIER MICELLAR VITAMIN C WATER 400ML
GARNIER PURE ACTIVE MICELLAR WATER 400ML
GARNIER VITAMIN C LOTION 400ML
GIGA WHITE GOLD LOTION
GIGA WHITE HALF CAST LOTION
GIGA WHITE TURMERIC LOTION
GLOWTHEORY CARE&MOISTURIZE LOTION 500ML
GLOWTHEORY PEPTIES BODY WASH 1000ML
GLOWTHEORY RICE BODY WASH 1000ML
GLOWTHEORY WHITE &SMOOTH LOTION 500ML
GLOWTHERAPY HYALURONIC BODY WASH 1000ML
GLOWTHERAPY RETINOL BODY WASH 1000ML
GLOWTHERAPY VITAMIN C BODY WASH 1000ML
GLUTA-C SOAP
GOLDEN GLOW  VIT.C SHOWER GEL 1000ML
GOLDEN GLOW CARROT SHOWER GEL 1000M
GOOD MOLECULES CORRECTING SERUM
HATOMUGI SUNSCREEN 258ML
HAWAII CARROT SOAP
HAWAII PAPAYA SOAP
HAYAATI LATTAFA PINK 100ML
HEALTHY GLOW ALPHA ARBUTIN BATH 1000ML
HEALTHY GLOW FACE CREAM BLACK
HEALTHY GLOW FACE CREAM GOLD
HEALTHY GLOW PRO LIGHTENING 400ML
HEALTHY GLOW SCRUB BLACK
HEALTHY GLOW SCRUB YELLOW
HEALTHY GLOW VIT-C BATH 1000ML
HEALTHY GLOW VIT-C LOTION 400ML
HEAVEN SCENT COCOA BUTTER CREAM 500ML
HIS CONFESSION LATTAFA 100ML
HONOUR & GLORY LATTAFA
IMPERIO WAY 25ML
ITALIAN FACE CREAM
JARDIN & OLEANE MOROCCAN BLACK SOAP 500G
JUST GLOW CARROT&VITAMIN C LOTION 500ML
JUST GLOW LICORICE+ALPHA ARBUTIN LOTION
K BROTHERS BAR SOAP
K.BROTHERS LIGHTENING SHOWER BATH 2000ML
KALY 50ML
KHAMRAH LATTAFA BLACK
KHAMRAH QAHWA LATTAFA
KIDS AND TEENS LOTION 250ML
KISS BEAUTY KOJIC ACID BODY GEL OIL
KISS BEAUTY MAKEUP REMOVER 400ML
KISS BEAUTY SHEET MASK PEACH
KISS BEAUTY SHEET MASK STRAWBERRY
KISS BEAUTY SNAIL BODY GEL OIL
KISS BEAUTY TURMERIC BODY GEL OIL
KOJIC ACID GLOW BODY OIL
KOJIC WHITE SOAP 160G
KOJIE SAN SOAP 3IN1 100G
KOJIE SAN SOAP SINGLE 135G
KOJIE SAN VITAMIN C SOAP 135G 2 IN 1
KOJIE SAN VITAMIN C SOAP 135G SINGLE
KOJIVIT ULTRA TUBE GEL 30G
KUU SPA PAPAYA&CARROT SCRUB
KUU SPA ROSE SCRUB
KUU SPA TURMERIC SCRUB
KUU SPA VIT C SCRUB
LACTIC CLAIRE BODY LOTION 500ML
LAFRESH APRICOT BODY SCRUB
LAIT ANEEZA CARROT LOTION  500ML
LAN SYADE ALOE VERA OIL
LASGIDI BODY MIST
LUXURY GLOW BODY OIL
MATELOT 100ML
MATELOT 50ML
MAYAR LATTAFA GREEN
MAYAR LATTAFA PINK
MEDIX 5.5 NIACINAMIDE&SHEA BUTTER LOTION
MEDIX 5.5 RETINOL&FERULIC ACID LOTION
MEDIX 5.5 VIT-C + TURMERIC LOTION
MOON WHITE BODY LOTION WHITE
MOON WHITE EXFOLIATING SHOWER GEL 1000ML
MOON WHITE FACE CREAM
MOON WHITE LOTION
MOOYAM ADVANCED SNAIL MUCIN CLEANSERS
MOOYAM STRAWBERRY FACIAL MASK 25ML
MORROCAN ARGAN OIL GLUTHATHIONE
MORROCAN ARGAN OIL SALICYLIC ACID
MORROCAN GOAT MILK SCRUB 650ML
MORROCAN TURMERIC & HONEY SCRUB 650ML
MOSUF 25ML
MOSUF 50ML
MOUSUF 100ML
NANO EXTRA WHITE PAPAYA SOAP
NANO EXTRA WHITE SCRUB TOMATO 750G
NANO EXTRA WHITE SCRUB TURMERIC 750G
NATURAL GLOW EMMALI BODY MILK 500ML
NEBRAS ELIXIR LATTAFA
NEUTROGENA BODY OIL 250ML
NEUTROGENA HYDRO BOOST WATER GEL
NEW EXPERIENCE FACE CREAM BLUE
NEW EXPERIENCE FACE CREAM PURPLE
NEW EXPERIENCE FACE CREAM RED
NINELESS AZELAIC ACID SERUM
NINELESS KOJIC ACID SERUM
NINELESS TRANEXAMIC SERUM
NIU SKIN BRIGHT&CLEAR FACE CREAM
NIU SKIN SERUM 30ML
NIU SKIN SUNSCREEN
NIU SKIN TOTAL EFFECT  PINK LOTION
NIU SKIN TOTAL EFFECTS FACE CREAM
NIU SKIN TOTAL EFFECTS GOLD LOTION 480ML
NIVEA CREME SHOWER BATH 500ML
NIVEA DEODORANT PEARL ROLL ON
NIVEA DEODORANT SPRAY DRY IMPACT
NIVEA EXPRESS HYDRATION LOTION
NIVEA MEN DEEP IMPACT 400ML
NIVEA MEN REVITALISING LOTION 400ML
NIVEA MEN ROLL ON BLACK&WHITE
NIVEA MEN ROLL ON DEEP ESPRESSO
NIVEA MEN ROLL ON DRY IMPACT
NIVEA NOURISHING COCOA LOTION 250ML
NIVEA NOURISHING COCOA LOTION 400ML
NIVEA PERFECT & RADIANT LOTION 400ML
NIVEA PERFECT RADIANT LOTION 250ML
NIVEA RADIANT & BEAUTY GLOW LOTION 400ML
NIVEA RICH NOURISHING LOTION 400ML
NIVEA ROLL ON DRY COMFORT
NIVEA SOFT MOIST CREAM 200ML
NIVEA SUNSCREEN 140G
NO MARKS CARROT & PAPAYA CLEANSER 100ML
NO MARKS TONER 200ML
NOBLE BLUSH LATTAFA
NOW ROUGE RED
OLAY CORRECTING SPOT  LOTION 502ML
OLAY HYALURONIC  LOTION 502ML
OLAY VITAMIN C LOTION 502ML
OPHYLIA 80ML
ORANGE ENZYMES EXFOLIATING GEL
OUD FOR GLORY LATTAFA
OUD NOIR 100ML
OXY 10 BENZOYL PEROXIDE
PALMERS COCOA BUTTER  LOTION  500ML
PALMERS COCOA BUTTER  LOTION 250ML
PALMERS COCOA BUTTER 270G
PALMERS COCOA BUTTER BODY OIL 250ML
PALMERS COCOA BUTTER LOTION 400ML
PALMERS COCOA BUTTER SKIN THERAPY OIL
PALMERS COCOA BUTTER STRETCH MARK CREAM
PALMERS SKIN SUCCESS TONER 250ML
PAMPERED STRETCH  MARK OIL 125ML
PANOXYL ACNE FOAMING WASH
PEARS BABY LOTION 200ML
PEARS BABY OIL 200ML
PEI MEI RETINOL SERUM
PEI MEI VITAMIN C SERUM
PERFECT CLINIC LOTION 500ML
PERFUME OILS
PICARDY EX-FOLIATE FACE WASH 120ML
PICARDY HAIR REMOVAL CREAM
PICARDY WHITENING FACE WASH 120ML
PRETTY COTTON PADS
PRO LAB ALPHA ARBUTIN LOTION 500ML
PRO LAB KOJIC LOTION 500ML
PURE INDIAN WHITE FACE CREAM
PUREC EGYPIAN CARROT LOTION 300ML
PUREC EGYPTIAN 3X HALFCAST LOTION 300ML
PUREC EGYPTIAN GOLD 300ML
PUREC EGYPTIAN GOLD FACE CREAM 50G
PUREC EGYPTIAN LIGHTENING SHOWER BATH
PUREC EGYPTIAN PAPAYA
PUREC EGYPTIAN SECRET 400ML
QEI PARIS LOTION WHITE
REXONA DEODORANT SPRAY
RHOME SOAP
S&K DUCHESS GLOW SHOWER GEL RED 1000ML
SADIA  SKIN RENEWAL  SERUM 30ML
SADIA ACNE CONTROL CLEANSER SALICYLIC
SADIA ADVANCED BRIGHTENING LOTION 500ML
SADIA ALPHA ARBUTIN SERUM 30ML
SADIA AMINO ACID CLEANSER 120ML
SADIA AZELAIC ACID SERUM
SADIA BAKUCHIOL SERUM 30ML
SADIA BRIGHTENING CLEANSER VITAMIN C
SADIA CAFFEINE EYE SERUM 30ML
SADIA CERAMIDE SERUM 30ML
SADIA DAILY FACIAL CLEANSER CERAMIDES
SADIA FLAWLESS GLOW LOTION 500ML
SADIA GLUTAHIONE SERUM
SADIA HYALU SERUM 30ML
SADIA INTENSIVE MOISTURIZIN LOTION 300ML
SADIA LACTIC ACID SERUM
SADIA PEELING MSK SERUM 30ML
SADIA RADIANT GLOW LOTION 500ML
SADIA RENEWAL SMOOTHING LOTION 300ML
SADIA RETINOL SERUM  30ML
SADIA SALICYLIC ACID CLEANSER 120M
SADIA TRANEXAMIC ACID SERUM 30ML
SADIA ULTRA FIRMING LOTION 500ML
SADIA VITAMIN C SERUM 30ML
SAHEB 100ML
SDGL NANO EXTRA WHITE VIT.C SHOWER GEL
SECRET GLOW ORGANIC BODY OIL
SIMPLE REFRESHING FACIAL WASH
SIMPLE REPLENISHING RICH MOISTURIZER
SK HONEY BODY WASH 1000ML
SK LUMINOUS GLOW BODY WASH 1000ML
SK RETINOL OIL
SK SKIN WHITENING BATH 1000ML
SK VIT-C&TURMERIC OIL
SK VIT-C+TURMERIC BODY WASH 1000ML
SKEENPOINT GLOW BOOSTER OIL
SKIN AQUA SUNSCREEN 110G
SKIN AQUA SUNSCREEN 140G
SKIN BY ZARON BRIGHTENING TONER
SKIN BY ZARON PAPAYA BODY WASH 650ML
SKIN BY ZARON SKIN GLOW LOTION  500ML
SKIN BY ZARON VITAMIN C BODY WASH 650ML
SKIN BY ZARON VIT-C LOTION
SKIN DOCTOR GLUTA GLOW LOTION
SKINDOCTOR CARROT GLOW LOTION
SKINDOCTOR EGYPTIAN GLOW LOTION
SKINDOCTOR GOLD LOTION
SKINEAL CREAM TUBE
SMOOTH AS SILK EXFOLIATING SOAP 200G
SMOOTH DIAMOND  LOTION 500ML
SMOOTH DIAMOND HALF CAST LOTION
SOLID WHITE INJECTION LOTION
SOME BY MII EXFOLIANTS
SOMPHUTIP CARROT SOAP
SPECIAL OUD 100ML
ST MICHEAL FLORENTYNA BODY POWDER 50ML
ST.IVES HYDRATING AVOCADO LOTION 621ML
ST.IVES PINK LEMON&MANDARIN BATH 1000ML
ST.IVES SMOOTHING ROSE LOTION 621ML
SUBLIME LATTAFA
SUMMER DREAM BODY MIST 100ML
SURE DEODORANT PINK BLUSH
SURE DEODORANT SPRAY COTTON DRY
SURE MEN  DEODORANT SPRAY INVICIBLE
SURE MEN DEODORANT SPRAY SPORT COOL
TEA TREE FACIAL SCRUB
TEA TREE FACIAL WIPES
TERA VET SUNBURN REPAIR FACE CREAM
THE ORDINARY ALPHA ARBUTIN SERUM
THE ORDINARY GLYCOLIC ACID TONER
THE ORDINARY NIACINAMIDE SERUM
TIAM NIACINAMIDE SERUM
TOPSY BODYWASH 500ML
TOPSY LEMON FRESH LOTION
TOSOWOONG ARBUTIN 7.0+ TXA 4.0 CREAM
TRETINOIN GEL 0.025
TRETINOIN GEL 0.05
TRETINOIN GEL 0.1
TRILUMA CREAM 15G
TURMERIC & HONEY SOAP
TURMERIC & KOJIC SOAP
UR WAY FRAGRANCE WORLD 100ML
USHAS HAND CREAM 50ML
VALENTINHO 25ML
VASELINE ADVANCED REPAIR LOTION 725ML
VASELINE B3 BODY OIL 200ML
VASELINE BLUESEAL ALOEVERA 100ML
VASELINE COCO GLOW LOTION 400ML
VASELINE COCOA RADIANT LOTION 725ML
VASELINE DAILY BRIGHTENING LOTION  600ML
VASELINE EVEN TONE LOTION 400ML
VASELINE GLUTA HYA DEWY LOTION 330ML
VASELINE GLUTA HYA FLAWLESS LOTION 330ML
VASELINE GLUTA VITAMIN LOTION 180ML
VASELINE HEALTHY BRIGHT LOTION 400ML
VEET GOLD TURMERIC BODY OIL 200ML
VEET HAIR REMOVAL CREAM
VEETGOLD BODY OIL 1000ML
VEETGOLD TURMERIC BODY OIL 500ML
VELVET OUD 100ML
VELVET ROSE 100ML
VICTORIA SECRETS BODY MISTS
VINTAGE RADIO LATTAFA
VIRGINIA ROSEWATER 450ML
WHITE SECRET LIGHTENING OIL 60ML
WHITE THERAPY SCRUB CARROT & HONEY
WHITE THERAPY TOMATO SCRUB
WHITE THERAPY TURMERIC SCRUB
WHITE THERAPY VITAMIN C SCRUB
WHITE TONE WHITENING FACE CREAM
WOKALI ALOE VERA FOOT SCRUB 500ML
WOKALI BODY SCRUB HONEY 500ML
WOKALI BODY SCRUB PAPAYA 500ML
WOKALI LEMON FOOT SCRUB 500ML
WONDER TONYMOLY TONER 300ML
WONDER TONYMOLY TONER 500ML
X7 SKINCARE LACTIC ACID LOTION
X7 SKINCARE NIACINAMIDE LOTION
X7 SKINCARE RETINOL LOTION 480ML
YARA LATTAFA PINK 100ML
ZAPZYT ACNE TREATMENT GEL
ZAPZYT ACNE WASH CLEANSER
`;

const IMAGES = {
  fragrance: [
    'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80'
  ],
  skincare_serum: [
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80'
  ],
  skincare_cream: [
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512290900672-1f025cb73105?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1567928815104-b6973dbab2a7?auto=format&fit=crop&w=600&q=80'
  ],
  cleanser_toner: [
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1556228852-80b6e5eeff06?auto=format&fit=crop&w=600&q=80'
  ],
  body_lotion: [
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80'
  ],
  body_oil_scrub: [
    'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1519735777090-ec97162dc266?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80'
  ],
  soap: [
    'https://images.unsplash.com/photo-1607006314175-68ff56d47b59?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=600&q=80'
  ],
  sunscreen: [
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80'
  ],
  lip_balm: [
    'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80'
  ]
};

function pickImage(category, name, idx) {
  const n = name.toLowerCase();
  if (category === 'fragrance' || n.includes('perfume') || n.includes('edp') || n.includes('mist')) {
    return IMAGES.fragrance[idx % IMAGES.fragrance.length];
  }
  if (n.includes('balm') || n.includes('lips')) {
    return IMAGES.lip_balm[idx % IMAGES.lip_balm.length];
  }
  if (n.includes('sunscreen') || n.includes('suncream') || n.includes('spf')) {
    return IMAGES.sunscreen[idx % IMAGES.sunscreen.length];
  }
  if (n.includes('soap')) {
    return IMAGES.soap[idx % IMAGES.soap.length];
  }
  if (n.includes('oil') || n.includes('scrub')) {
    return IMAGES.body_oil_scrub[idx % IMAGES.body_oil_scrub.length];
  }
  if (n.includes('cleanser') || n.includes('toner') || n.includes('wash') || n.includes('micellar')) {
    return IMAGES.cleanser_toner[idx % IMAGES.cleanser_toner.length];
  }
  if (n.includes('serum')) {
    return IMAGES.skincare_serum[idx % IMAGES.skincare_serum.length];
  }
  if (n.includes('cream') || n.includes('gel')) {
    return IMAGES.skincare_cream[idx % IMAGES.skincare_cream.length];
  }
  return IMAGES.body_lotion[idx % IMAGES.body_lotion.length];
}

function generateAIDescription(name, upper, category, brand) {
  // Specific tailored descriptions for top popular products
  if (upper.includes('9PM BLACK AFNAN')) {
    return 'A magnetic, evening-focused oriental amber fragrance with opening notes of wild apple, cinnamon, and lavender that melt into warm bourbon vanilla, tonka bean, and patchouli. Outstanding projection and 12+ hour sillage.';
  }
  if (upper.includes('9PM ELIXIR AFNAN')) {
    return 'An intense, high-concentration elixir flanker amplifying rich spicy accords, deep resinous amber, smoked woods, and velvety vanilla for an intoxicating, head-turning signature.';
  }
  if (upper.includes('9PM REBEL AFNAN')) {
    return 'A bold, daring scent blending crisp citrus and fiery pink pepper with a dark cedarwood and leathery heart. Perfect for confident individuals making an unforgettable entrance.';
  }
  if (upper.includes('KHAMRAH QAHWA')) {
    return 'A lavish gourmand masterpiece opening with fresh cardamom and roasted Arabica coffee, blooming into candied praline, white florals, tonka bean, and comforting bourbon vanilla.';
  }
  if (upper.includes('KHAMRAH LATTAFA')) {
    return 'A world-famous opulent sweet spicy fragrance radiating rich cinnamon, nutmeg, dates, and creamy praline over a warm benzoin and amber base. Extraordinary projection.';
  }
  if (upper.includes('ASAD LATTAFA')) {
    return 'A sophisticated, masculine spicy-woody Eau de Parfum featuring black pepper, pineapple, coffee, iris, and dry amber. A renowned high-compliment signature.';
  }
  if (upper.includes('YARA LATTAFA')) {
    return 'A sweet, feminine confection blending fluffy marshmallow, tropical fruits, orchid, vanilla, and creamy sandalwood. Youthful, luminous, and irresistibly cozy.';
  }
  if (upper.includes('ECLAIRE LATTAFA')) {
    return 'A mouthwatering gourmand perfume with rich caramel, warm condensed milk, honey, white flowers, and melted brown sugar. Long-lasting cozy sweetness.';
  }
  if (upper.includes('COSRX ADVANCED SNAIL 96')) {
    return 'A cult-favorite Korean essence enriched with 96.3% snail secretion filtrate to deeply hydrate, soothe irritation, accelerate barrier recovery, and bestow an authentic dewy glass-skin finish.';
  }
  if (upper.includes('ACWELL') && upper.includes('TONER')) {
    return 'A clean, balancing toner formulated with licorice root extract, peony extract, and green tea to brighten dull tone, purify residual sebum, and balance skin pH to an optimal 5.5.';
  }
  if (upper.includes('ANUA NIACINAMIDE')) {
    return 'A high-performance Korean brightening serum formulated with 10% niacinamide and 4% tranexamic acid to fade stubborn post-acne dark marks, redness, and hyperpigmentation.';
  }
  if (upper.includes('AXIS-Y DARK SPOT')) {
    return 'A barrier-friendly brightening treatment blending 5% niacinamide with botanical squalane, rice bran, and papaya extract to fade hyperpigmentation while retaining deep moisture.';
  }
  if (upper.includes('TRETINOIN GEL')) {
    return 'A prescription-strength dermatological retinoid gel that dramatically accelerates cellular turnover, clears resistant comedones and cystic acne, and refines uneven dermal texture.';
  }
  if (upper.includes('AZELAIC ACID GEL 20%')) {
    return 'A clinical-strength 20% azelaic acid topical gel proven to target acne bacteria, soothe rosacea and inflammatory redness, and fade recalcitrant post-inflammatory dark spots.';
  }
  if (upper.includes('PANOXYL') || upper.includes('BENZOYL PEROXIDE') || upper.includes('OXY 10') || upper.includes('ZAPZYT')) {
    return 'An antimicrobial acne treatment formulated with active benzoyl peroxide to penetrate deep into follicles, killing acne-causing P. acnes bacteria and clearing stubborn breakouts.';
  }
  if (upper.includes('THE ORDINARY GLYCOLIC')) {
    return 'A 7% glycolic acid exfoliating tonic that gently loosens dead surface keratin, enhances skin luminosity, and visibly improves clarity on face, neck, underarms, and textured body areas.';
  }
  if (upper.includes('THE ORDINARY NIACINAMIDE')) {
    return 'A potent serum combining 10% pure niacinamide with 1% zinc PCA to balance excessive sebum activity, minimize congested pores, and enhance overall skin clarity.';
  }
  if (upper.includes('CERAVE') && upper.includes('SA')) {
    return 'A dermatologist-developed chemical smoothing formula blending salicylic acid, lactic acid, hyaluronic acid, and 3 essential ceramides to smooth rough, bumpy Keratosis Pilaris skin.';
  }
  if (upper.includes('CERAVE') && upper.includes('HYDRATING')) {
    return 'A gentle, non-foaming lotion cleanser formulated with MVE delivery technology, hyaluronic acid, and ceramides to cleanse effectively without disrupting the natural moisture barrier.';
  }
  if (upper.includes('KOJIE SAN')) {
    return 'The original, authentic Philippine beauty bar crafted with high-grade zero-pigment kojic acid and moisturizing coconut oil to rapidly diminish sun spots, age spots, and uneven pigmentation.';
  }
  if (upper.includes('DUDU OSUN')) {
    return 'An authentic Nigerian herbal black soap handcrafted from pure palm bunch ash, shea butter, aloe vera, camwood, and lime juice to deep-cleanse pores, soothe irritation, and clarify blemishes.';
  }
  if (upper.includes('MOROCCAN BLACK SOAP') || upper.includes('AL TAG') || upper.includes('JARDIN & OLEANE')) {
    return 'A traditional, 100% natural saponified olive oil black soap rich in vitamin E. Prepares the skin for deep kessa mitt exfoliation, peeling away dead skin cells to reveal silk-soft radiance.';
  }
  if (upper.includes('BIO OIL')) {
    return 'A clinically proven, PurCellin Oil-based skincare oil formulated to improve the appearance of scars, stretch marks, uneven skin tone, aging skin, and dehydrated dermal barriers.';
  }
  if (upper.includes('VASELINE GLUTA HYA')) {
    return 'An ultra-light, serum-burst lotion infused with GlutaGlow (10x more powerful than Vitamin C) and pro-hyaluron to deliver luminous, glowing skin with immediate hydration and zero greasiness.';
  }
  if (upper.includes('DR TEALS') && upper.includes('BODY WASH')) {
    return 'A restorative bath wash formulated with pure Epsom salt, nourishing aloe vera, and essential oils to relax tense muscles, hydrate dry skin, and awaken the senses with therapeutic aromatics.';
  }
  if (upper.includes('CANTU SHEA BUTTER')) {
    return 'An award-winning deep-penetrating conditioning treatment made with 100% pure shea butter and natural oils to stop breakage, repair split ends, and restore curl elasticity.';
  }
  if (upper.includes('NEUTROGENA HYDRO BOOST')) {
    return 'An oil-free, gel-cream moisturizer formulated with purified hyaluronic acid that acts like a sponge for dry skin cells, quenching thirst and locking in moisture for 48 hours.';
  }

  // Systematic AI-generated fallback according to product components
  if (category === 'fragrance') {
    return `An exquisite fine fragrance blend designed with remarkable longevity and sillage. Features sophisticated top notes transitioning into a rich heart of florals, spice, or woods, resting on an enduring, seductive base.`;
  }
  if (upper.includes('SERUM')) {
    return `A concentrated, fast-absorbing corrective serum packed with bio-compatible actives. Penetrates deep into the dermal matrix to fade pigmentation, smooth uneven texture, and restore youthful luminescence.`;
  }
  if (upper.includes('BODY LOTION') || upper.includes('BODY MILK') || upper.includes('LOTION')) {
    return `An ultra-hydrating, non-greasy daily body formula packed with replenishing emollients and brightening agents. Restores moisture resilience, evens skin tone, and leaves the skin noticeably velvety.`;
  }
  if (upper.includes('BODY OIL') || upper.includes('OIL')) {
    return `A lightweight, nutrient-dense botanical oil that locks in post-shower hydration, soothes dry areas, and envelops the body in a radiant, satin-sheen glow with essential lipid replenishment.`;
  }
  if (upper.includes('SCRUB')) {
    return `A rich, exfoliating botanical polish designed to buff away stubborn dead skin cells and surface debris. Rejuvenates dull patches and leaves skin extraordinarily smooth, supple, and radiant.`;
  }
  if (upper.includes('SOAP')) {
    return `A clarifying beauty bar that generates a dense, luxurious lather to thoroughly cleanse impurities, normalize excess sebum, and promote an even, healthy, blemish-free complexion.`;
  }
  if (upper.includes('CLEANSER') || upper.includes('WASH')) {
    return `A gentle, pH-balanced daily wash formulated to lift surface impurities, pollutant residues, and excess oil without stripping essential natural lipids or causing tightness.`;
  }
  if (upper.includes('TONER')) {
    return `An essential clarifying and pore-refining tonic that balances natural skin acidity, calms irritation, and primes the dermal layers for superior penetration of serums and moisturizers.`;
  }
  if (upper.includes('SUNSCREEN') || upper.includes('SUNCREAM')) {
    return `A high-performance, broad-spectrum UV defense formulation that shields delicate skin from UVA/UVB rays without chalkiness, pore congestion, or greasy film.`;
  }
  if (upper.includes('CREAM') || upper.includes('GEL')) {
    return `A targeted cellular repair cream delivering intense moisture and active nutrients to reinforce the skin barrier, calm inflammation, and impart a fresh, hydrated bounce.`;
  }
  return `A premium, dermatologist-approved beauty formulation developed with skin-nourishing botanical extracts. Integrates seamlessly into daily AM/PM routines for visible clarity and long-lasting radiance.`;
}

function parseItem(raw, index) {
  const name = raw.trim().replace(/\s+/g, ' ');
  const upper = name.toUpperCase();

  // Category determination
  let category = 'skincare';
  if (
    upper.includes('LATTAFA') ||
    upper.includes('AFNAN') ||
    upper.includes('MIST') ||
    upper.includes('BERRIES WEEKEND') ||
    upper.includes('BAKKARAT') ||
    upper.includes('OUD') ||
    upper.includes('AVENTOS') ||
    upper.includes('ECLAIR') ||
    upper.includes('MOSUF') ||
    upper.includes('MOUSUF') ||
    upper.includes('SAHEB') ||
    upper.includes('KHAMRAH') ||
    upper.includes('ASAD') ||
    upper.includes('MAYAR') ||
    upper.includes('HAYAATI') ||
    upper.includes('NEBRAS') ||
    upper.includes('VALENTINHO') ||
    upper.includes('PERFUME') ||
    upper.includes('BODY SPRAY') ||
    upper.includes('NOW ROUGE') ||
    upper.includes('OPHYLIA') ||
    upper.includes('UR WAY') ||
    upper.includes('LASGIDI') ||
    upper.includes('VICTORIA')
  ) {
    category = 'fragrance';
  } else if (upper.includes('LIP') || upper.includes('BALM')) {
    category = 'balms';
  } else if (
    upper.includes('BODY LOTION') ||
    upper.includes('BODY MILK') ||
    upper.includes('BODY WASH') ||
    upper.includes('BODY OIL') ||
    upper.includes('BODY SCRUB') ||
    upper.includes('BATH') ||
    upper.includes('SHOWER') ||
    upper.includes('DEODORANT') ||
    upper.includes('ROLL ON') ||
    upper.includes('SOAP') ||
    upper.includes('BUTTER') ||
    upper.includes('HAND CREAM') ||
    upper.includes('FOOT SCRUB') ||
    upper.includes('HAIR REMOVAL') ||
    upper.includes('VASELINE') ||
    upper.includes('DOVE') ||
    upper.includes('NIVEA') ||
    upper.includes('DR TEALS') ||
    upper.includes('PALMERS') ||
    upper.includes('ST.IVES') ||
    upper.includes('VEET')
  ) {
    category = 'body';
  } else if (upper.includes('MAKEUP') || upper.includes('POWDER') || upper.includes('COTTON PADS')) {
    category = 'makeup';
  }

  // Brand determination
  let brand = 'Turpeen Cosmetics';
  let origin = '🇰🇷 Korea';

  if (upper.includes('AFNAN')) {
    brand = 'Afnan Perfumes';
    origin = '🇦🇪 UAE';
  } else if (upper.includes('LATTAFA')) {
    brand = 'Lattafa Perfumes';
    origin = '🇦🇪 UAE';
  } else if (upper.includes('ACWELL')) {
    brand = 'Acwell';
    origin = '🇰🇷 Korea';
  } else if (upper.includes('ADVANCED KOREAN')) {
    brand = 'Advanced Korean';
    origin = '🇰🇷 Korea';
  } else if (upper.includes('ANUA')) {
    brand = 'Anua';
    origin = '🇰🇷 Korea';
  } else if (upper.includes('COSRX')) {
    brand = 'COSRX';
    origin = '🇰🇷 Korea';
  } else if (upper.includes('CERAVE')) {
    brand = 'CeraVe';
    origin = '🇺🇸 USA';
  } else if (upper.includes('DOVE')) {
    brand = 'Dove';
    origin = '🇬🇧 UK';
  } else if (upper.includes('DR TEALS') || upper.includes("DR TEAL'S")) {
    brand = "Dr Teal's";
    origin = '🇺🇸 USA';
  } else if (upper.includes('NIVEA')) {
    brand = 'Nivea';
    origin = '🇩🇪 Germany';
  } else if (upper.includes('PALMERS')) {
    brand = "Palmer's";
    origin = '🇺🇸 USA';
  } else if (upper.includes('FACEFACTS') || upper.includes('FACE FACTS') || upper.includes('FACEFACT')) {
    brand = 'Face Facts';
    origin = '🇬🇧 UK';
  } else if (upper.includes('ESTELIN')) {
    brand = 'Estelin';
    origin = '🇰🇷 Korea';
  } else if (upper.includes('DR RASHEL')) {
    brand = 'Dr. Rashel';
    origin = '🇦🇪 UAE';
  } else if (upper.includes('SADIA')) {
    brand = 'Sadia Skincare';
    origin = '🇬🇧 UK';
  } else if (upper.includes('THE ORDINARY')) {
    brand = 'The Ordinary';
    origin = '🇨🇦 Canada';
  } else if (upper.includes('DISAAR')) {
    brand = 'Disaar';
    origin = '🇹🇭 Thailand';
  } else if (upper.includes('KOJIE SAN')) {
    brand = 'Kojie San';
    origin = '🇵🇭 Philippines';
  } else if (upper.includes('FAIR & WHITE') || upper.includes('FAIR&WHITE') || upper.includes('F&W')) {
    brand = 'Fair & White Paris';
    origin = '🇫🇷 France';
  } else if (upper.includes('FILIPINO')) {
    brand = 'Filipino Skincare';
    origin = '🇵🇭 Philippines';
  } else if (upper.includes('VASELINE')) {
    brand = 'Vaseline';
    origin = '🇺🇸 USA';
  } else if (upper.includes('VEETGOLD') || upper.includes('VEET GOLD')) {
    brand = 'Veet Gold';
    origin = '🇹🇭 Thailand';
  } else if (upper.includes('PUREC EGYPTIAN') || upper.includes('PUREC EGYPIAN')) {
    brand = 'Purec Egyptian';
    origin = '🇪🇬 Egypt';
  } else if (upper.includes('MORROCAN') || upper.includes('MOROCCAN') || upper.includes('JARDIN')) {
    brand = 'Moroccan Organics';
    origin = '🇲🇦 Morocco';
  } else if (upper.includes('COSMO')) {
    brand = 'Cosmo Cosmetics';
    origin = '🇦🇪 UAE';
  } else if (upper.includes('BEAUTY FORMULAS') || upper.includes('BEAUTY FORMULA') || upper.includes('BEAUTY FORMULAR')) {
    brand = 'Beauty Formulas';
    origin = '🇬🇧 UK';
  } else if (upper.includes('GARNIER')) {
    brand = 'Garnier';
    origin = '🇫🇷 France';
  } else if (upper.includes('SIMPLE')) {
    brand = 'Simple Skincare';
    origin = '🇬🇧 UK';
  } else if (upper.includes('NEUTROGENA')) {
    brand = 'Neutrogena';
    origin = '🇺🇸 USA';
  } else if (upper.includes('SKIN BY ZARON')) {
    brand = 'Skin by Zaron';
    origin = '🇳🇬 Nigeria';
  } else if (upper.includes('WOKALI')) {
    brand = 'Wokali';
    origin = '🇫🇷 France';
  } else if (upper.includes('ST.IVES') || upper.includes('ST. IVES')) {
    brand = "St. Ives";
    origin = '🇺🇸 USA';
  } else if (upper.includes('SURE')) {
    brand = 'Sure';
    origin = '🇬🇧 UK';
  } else if (upper.includes('EDEN')) {
    brand = 'Eden Apricot';
    origin = '🇺🇸 USA';
  } else if (upper.includes('BIO OIL')) {
    brand = 'Bio-Oil';
    origin = '🇿🇦 South Africa';
  } else if (upper.includes('DUDU OSUN')) {
    brand = 'Dudu-Osun';
    origin = '🇳🇬 Nigeria';
  } else if (upper.includes('EOS')) {
    brand = 'eos Evolution of Smooth';
    origin = '🇺🇸 USA';
  } else if (upper.includes('TRETINOIN')) {
    brand = 'Dermacare Clinical';
    origin = '🇮🇳 India';
  } else if (upper.includes('NINELESS')) {
    brand = 'Nineless';
    origin = '🇰🇷 Korea';
  } else if (upper.includes('SKIN AQUA')) {
    brand = 'Skin Aqua Rohto';
    origin = '🇯🇵 Japan';
  } else if (upper.includes('BIORE')) {
    brand = 'Bioré';
    origin = '🇯🇵 Japan';
  } else if (upper.includes('MISSHA')) {
    brand = 'Missha';
    origin = '🇰🇷 Korea';
  }

  // Realistic Nigerian Naira beauty market pricing
  let priceNum = 18500;
  if (category === 'fragrance') {
    if (upper.includes('KHAMRAH') || upper.includes('ASAD') || upper.includes('9PM') || upper.includes('NEBRAS') || upper.includes('VINTAGE RADIO')) {
      priceNum = 48500;
    } else if (upper.includes('25ML') || upper.includes('50ML')) {
      priceNum = 16500;
    } else if (upper.includes('MIST') || upper.includes('BODY SPRAY')) {
      priceNum = 19500;
    } else {
      priceNum = 38000;
    }
  } else if (upper.includes('1000ML') || upper.includes('BATH') || upper.includes('SHOWER')) {
    priceNum = 24500;
  } else if (upper.includes('CERAVE') || upper.includes('COSRX') || upper.includes('ANUA') || upper.includes('AXIS-Y') || upper.includes('NEUTROGENA')) {
    priceNum = 29500;
  } else if (upper.includes('THE ORDINARY') || upper.includes('GOOD MOLECULES') || upper.includes('NINELESS')) {
    priceNum = 22000;
  } else if (upper.includes('SERUM') || upper.includes('SUNSCREEN') || upper.includes('SUNCREAM')) {
    priceNum = 18500;
  } else if (upper.includes('SOAP')) {
    if (upper.includes('DUDU OSUN')) priceNum = 2500;
    else if (upper.includes('KOJIE SAN') || upper.includes('ALADA')) priceNum = 4800;
    else priceNum = 5500;
  } else if (upper.includes('SCRUB')) {
    priceNum = 14500;
  } else if (upper.includes('OIL')) {
    priceNum = 16500;
  } else if (upper.includes('LOTION') || upper.includes('MILK')) {
    priceNum = 21000;
  } else if (upper.includes('WIPES') || upper.includes('COTTON')) {
    priceNum = 4500;
  } else if (upper.includes('ROLL ON') || upper.includes('DEODORANT')) {
    priceNum = 6500;
  } else if (upper.includes('BALM')) {
    priceNum = 6000;
  }

  // Price variation
  const priceVariations = [0, 500, -500, 1000, -1000, 1500, 2000, -1500];
  priceNum = Math.max(2500, priceNum + priceVariations[index % priceVariations.length]);
  const originalPriceNum = Math.round((priceNum * 1.15) / 500) * 500;

  // Subtitle generation
  let subtitle = 'Active Radiance & Moisture';
  if (category === 'fragrance') {
    subtitle = upper.includes('MIST') ? 'Long-Lasting Fragrant Mist' : 'Eau De Parfum / Fine Fragrance';
  } else if (upper.includes('SERUM')) {
    subtitle = 'Concentrated Brightening & Repair Serum';
  } else if (upper.includes('LOTION') || upper.includes('MILK')) {
    subtitle = 'Deep Moisture & Radiant Glow Lotion';
  } else if (upper.includes('OIL')) {
    subtitle = 'Botanical Nourishing Glow Body Oil';
  } else if (upper.includes('SCRUB')) {
    subtitle = 'Gentle Exfoliating & Smoothing Polish';
  } else if (upper.includes('SOAP')) {
    subtitle = 'Clarifying & Conditioning Herbal Bar';
  } else if (upper.includes('CLEANSER') || upper.includes('WASH')) {
    subtitle = 'pH-Balanced Gentle Clarifying Cleanser';
  } else if (upper.includes('TONER')) {
    subtitle = 'Pore-Refining Balancing Hydration Toner';
  } else if (upper.includes('SUNSCREEN') || upper.includes('SUNCREAM')) {
    subtitle = 'High-Protection Invisible UV Barrier';
  } else if (upper.includes('CREAM') || upper.includes('GEL')) {
    subtitle = 'Intensive Cellular Hydration & Barrier Cream';
  }

  // AI-generated Editorial Description
  const description = generateAIDescription(name, upper, category, brand);

  // Badges
  let badge = null;
  let badgeType = null;
  if (index % 7 === 0) {
    badge = 'BEST SELLER';
    badgeType = 'best';
  } else if (index % 11 === 0) {
    badge = 'TRENDING';
    badgeType = 'new';
  } else if (index % 13 === 0) {
    badge = 'TOP RATED';
    badgeType = 'rated';
  }

  const rating = Number((4.6 + ((index % 5) * 0.08)).toFixed(1));
  const id = `tp-${String(index + 1).padStart(3, '0')}`;
  const image = pickImage(category, name, index);

  return {
    id,
    name,
    subtitle,
    brand,
    price: `₦${priceNum.toLocaleString()}`,
    price_numeric: priceNum,
    original_price: originalPriceNum ? `₦${originalPriceNum.toLocaleString()}` : null,
    badge,
    badge_type: badgeType,
    image,
    images: [image],
    category,
    origin,
    rating,
    in_stock: true,
    swatches: [],
    description
  };
}

const lines = rawProductList.split('\n').map(s => s.trim()).filter(Boolean);
const parsedProducts = lines.map((line, idx) => parseItem(line, idx));

// Helper to escape single quotes in SQL string literals
function esc(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

// Generate the SQL script
let sql = `-- ====================================================================
-- TURPEEN COSMETICS • PRODUCT CATALOGUE SEED SQL
-- Generated for PostgreSQL / Supabase 'products' table
-- Total Products: ${parsedProducts.length}
-- Structure maintained:
--   id, name, subtitle, brand, price, price_numeric, original_price,
--   badge, badge_type, image, images, category, origin, rating,
--   in_stock, swatches, description, created_at, updated_at
-- ====================================================================

-- Ensure table structure exists if not already present
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subtitle TEXT,
  brand TEXT,
  price TEXT NOT NULL,
  price_numeric NUMERIC,
  original_price TEXT,
  badge TEXT,
  badge_type TEXT,
  image TEXT NOT NULL,
  images TEXT[] DEFAULT '{}'::text[],
  category TEXT NOT NULL,
  origin TEXT,
  rating NUMERIC DEFAULT 4.8,
  in_stock BOOLEAN DEFAULT true,
  swatches JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert statement with ON CONFLICT UPDATE to ensure idempotent execution
INSERT INTO public.products (
  id,
  name,
  subtitle,
  brand,
  price,
  price_numeric,
  original_price,
  badge,
  badge_type,
  image,
  images,
  category,
  origin,
  rating,
  in_stock,
  swatches,
  description,
  created_at,
  updated_at
)
VALUES
`;

const rowsSQL = parsedProducts.map(p => {
  const imagesArraySQL = p.images && p.images.length > 0
    ? `ARRAY[${p.images.map(img => esc(img)).join(', ')}]::text[]`
    : `'{}'::text[]`;
  const swatchesJson = JSON.stringify(p.swatches || []);

  return `(
  ${esc(p.id)},
  ${esc(p.name)},
  ${esc(p.subtitle)},
  ${esc(p.brand)},
  ${esc(p.price)},
  ${p.price_numeric},
  ${p.original_price ? esc(p.original_price) : 'NULL'},
  ${p.badge ? esc(p.badge) : 'NULL'},
  ${p.badge_type ? esc(p.badge_type) : 'NULL'},
  ${esc(p.image)},
  ${imagesArraySQL},
  ${esc(p.category)},
  ${esc(p.origin)},
  ${p.rating},
  ${p.in_stock},
  ${esc(swatchesJson)}::jsonb,
  ${esc(p.description)},
  NOW(),
  NOW()
)`;
}).join(',\n');

sql += `${rowsSQL}
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  subtitle = EXCLUDED.subtitle,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  price_numeric = EXCLUDED.price_numeric,
  original_price = EXCLUDED.original_price,
  badge = EXCLUDED.badge,
  badge_type = EXCLUDED.badge_type,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  category = EXCLUDED.category,
  origin = EXCLUDED.origin,
  rating = EXCLUDED.rating,
  in_stock = EXCLUDED.in_stock,
  swatches = EXCLUDED.swatches,
  description = EXCLUDED.description,
  updated_at = NOW();
`;

fs.writeFileSync(path.join(__dirname, '../insert_products.sql'), sql, 'utf8');
console.log('Successfully regenerated insert_products.sql with', parsedProducts.length, 'records.');

module.exports = { parsedProducts };
