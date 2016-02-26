# E2E-testning

## Installation

Installera [nightwatch](http://nightwatchjs.org/)

    $ npm install -g nightwatch

Ladda ner den senaste versionen av selenium-server-standalone från [denna sidan](http://selenium-release.storage.googleapis.com/index.html) och placera JAR-filen i ``bin/``:

    $ curl http://selenium-release.storage.googleapis.com/2.50/selenium-server-standalone-2.50.1.jar -o bin/selenium-server-standalone.jar

Om du vill köra test i Chrome så behöver du Chromedriver som finns att ladda ner [här](https://code.google.com/p/selenium/wiki/ChromeDriver). Lägg den i ``bin/``:

    $ curl http://chromedriver.storage.googleapis.com/2.21/chromedriver_mac32.zip -o bin/chromedriver.zip && pushd bin && unzip chromedriver.zip && popd

## Konfiguera

Portnummer kan anpassas i ``nightwatch.json``.

## Köra tester

Gå till ``tests``:

    $ cd tests

Kör test:

    $ nightwatch --test specs/viewer.js

Kör test med specifika environments, i exemplet körs default=firefox och chrome (enligt nightwatch.json)

    $ nightwatch --test specs/viewer.js -e default,chrome

## Stänga ner selenium

När ett test kraschar under körning (t ex vid syntaxfel i testkoden) och man försöker köra igen, så kan man få felet att ens port redan är upptagen. Du kan då stänga ner Selenium genom att kalla på följande adress i din browser:

http://localhost:4444/selenium-server/driver/?cmd=shutDownSeleniumServer
