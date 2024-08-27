# Font preparation

We use [fonttools](https://fonttools.readthedocs.io) to create a subset of
the full Roboto Flex variable font and to convert it to a more suitable format. Installation instructions can be found
[here](https://clagnut.com/blog/2418/). Currently, one of the main reasons we use a
variable font is to support the project specific custom "condensed" style (see `tailwind.config.js`).

## Subsetting

The full font can be subset by running the following command in a terminal

    $ fonttools varLib.instancer -o RobotoFlex-reduced.ttf
        RobotoFlex-VariableFont_GRAD,XTRA,YOPQ,YTAS,YTDE,YTFI,YTLC,YTUC,opsz,slnt,wdth,wght.ttf
        "XTRA=drop" "GRAD=drop" "YOPQ=drop" "YTAS=drop" "YTDE=drop" "YTFI=drop" "YTLC=drop" "YTUC=drop"
        "wght=400:800" "wdth=60:100"

where we have put limits on the `wght` and `wdth` variable font axes (corresponding to the CSS properties
`font-weight` and `font-stretch` respectively) and fixed the rest. This approximately halves the size of the original
`ttf`-file.

## Conversion

The next step is to compress `RobotoFlex-reduced.ttf` by converting it to the `woff2` format. This is done by running

    $ pyftsubset RobotoFlex-reduced.ttf
    --unicodes="U+0020-007F, U+00A0-00FF, U+0100-017F, U+2000-206F,
                U+2070-209F, U+20A0-20CF, U+2100-214F, U+2200-22FF, U+FB00-FB4F"
    --layout-features='*'
    --flavor="woff2"
    --output-file="RobotoFlex-VariableReduced.woff2"

See the [font tools documentation](https://fonttools.readthedocs.io/en/latest/subset/index.html#module-fontTools.subset)
for details on options etc.

The `@font-face` CSS statement in `app.css` specifies which font file is used in the project. Here the converted `woff2`-file
is to be used in the test and production environments whereas the full variable font (`RobotoFlex-VariableFont_GRAD,XTRA,YOPQ,YTAS,YTDE,YTFI,YTLC,YTUC,opsz,slnt,wdth,wght.ttf`)
can be used for experimentation and development of new styles.
