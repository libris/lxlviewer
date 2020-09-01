describe('LXL viewer', () => {

  describe('id.kb.se', () => {

    describe('Index', () => {

      it('Should load', (client) => {
        client
          .url('http://localhost:5000/')
          .waitForElementPresent('main', 5000)
      })

      it('Should show 3 scheme links in the intro panel', (client) => {
        client.elements('css selector','main.container .intro-text .list-group-item', (result) => {
          client.assert.equal(result.value.length, 3)
        })
      })

      it('Should show 3 scheme panels', (client) => {
        client.elements('css selector','main.container .scheme-item', (result) => {
          client.assert.equal(result.value.length, 3)
        })
      })

    })

    describe('Collection view', () => {

      it('Should load', (client) => {
        client
          .url('http://localhost:5000/find?q=*')
          .waitForElementPresent('main', 10000)
          .expect.element('.no-results').to.not.be.present
      })

      it('Should have search controls', (client) => {
          client.expect.element('.pagination-firstpage').to.be.present
          client.expect.element('.pagination-back').to.be.present
          client.expect.element('.pagination-next').to.be.present
      })

      it('Should disable/enable pagination buttons when no destination', (client) => {
        client.expect.element('.pagination-firstpage').to.have.attribute('disabled')
        client.expect.element('.pagination-back').to.have.attribute('disabled')
        client.expect.element('.pagination-next').to.not.have.attribute('disabled')
      })

      it('Should limit search results per page', (client) => {

        client
          .url('http://localhost:5000/find?q=*&limit=50')
          .waitForElementPresent('main', 5000)

        client
          .expect.element('.hit-item').to.be.present

        client.elements('css selector','.hit-item', (client) => {
          client.assert.equal(result.value.length, 50)
        })

        client
          .url('http://localhost:5000/find?q=*&limit=10')
          .waitForElementPresent('main', 5000)

        client.elements('css selector','.hit-item', (client) => {
          client.assert.equal(result.value.length, 10)
        })

      })

      it('Should show message if no results were found', (client) => {
        client
          .url('http://localhost:5000/find?limit=50&p=prefLabel&q=invalidquery')
          .waitForElementPresent('main', 5000)

          client.expect.element('.no-results').to.be.present
      })

    })

    describe('Thing view', () => {

      it('Should load', (client) => {
        client
          .url('http://localhost:5000/term/sao/Deckare')
          .waitForElementPresent('main', 5000)
      })

      it('Should show a thing', (client) => {
        client.expect.element('.main-item').to.be.present
        client.expect.element('.main-item .thing-label').to.be.present
        client.expect.element('.main-item dl').to.be.present
      })

      it('Should show vocab popup on property click', (client) => {
        client.click('.main-item dl dt a', () => {
            client.expect.element('#embedvocab').to.be.visible.before(10000)
          })
      })

      it('Should show vocab popup on class click', (client) => {
        client.click('.main-item .panel-heading .label-class', () => {
            client.expect.element('#embedvocab').to.be.visible.before(5000)
          })
      })

      it('Should hide vocab popup on click outside popup', (client) => {
        client.click('footer .navbar-text', () => {
            client.expect.element('#embedvocab').to.not.be.visible.before(5000)
          })
      })

    })

    describe('Marcframe view', () => {

      it('Should load', (client) => {
        client
          .url('http://localhost:5000/marcframeview/')
          .waitForElementPresent('main', 5000)
      })

      it('Sidenav Should show a menu of categories', (client) => {
        client.expect.element('.nav-col .nav-tabs').to.be.present
      })

      it('Sidenav Should initially show BIB fields', (client) => {
        client.expect.element('.nav-col .nav-tabs .active a').text.to.equal('bib')
        client.expect.element('#tab-bib').to.be.visible
        client.expect.element('#tab-auth').to.not.be.visible
        client.expect.element('#tab-hold').to.not.be.visible
      })

      it('Sidenav Should switch fields when another tab is clicked', (client) => {
        client.click('a[href="#tab-auth"]', () => {
          client.expect.element('#tab-bib').to.not.be.visible
          client.expect.element('#tab-auth').to.be.visible
          client.expect.element('#tab-hold').to.not.be.visible
        })
      })

    })

    describe('Vocab view', () => {

      it('Should load', (client) => {
        client
          .url('http://localhost:5000/vocab')
          .waitForElementPresent('main', 5000)
      })

      it('Sidenav should show classes', (client) => {
        client.expect.element('.nav-col .nav-classes').to.be.present
      })

      it('Sidenav should show properties', (client) => {
        client.expect.element('.nav-col .nav-properties').to.be.present
      })

    })

    after((client, done) => {
      client.end(() => {
        done()
      })
    })

  })

  describe('libris.kb.se', () => {

    describe('Index', () => {

      it('Should load', (client) => {
        client.url('http://127.0.0.1:5000')
        .waitForElementPresent('main', 5000)
      })

    })

    describe('Collection view', () => {

      it('Should load', (client) => {
        client
          .url('http://127.0.0.1:5000/find?limit=50&q=Lord+of+the+rings')
          .waitForElementPresent('main', 5000)
          .expect.element('.no-results').to.not.be.present
      })

      it('Should have search controls', (client) => {
          client.expect.element('.pagination-firstpage').to.be.present
          client.expect.element('.pagination-back').to.be.present
          client.expect.element('.pagination-next').to.be.present
      })

      it('Should disable/enable pagination buttons when no destination', (client) => {
        client.expect.element('.pagination-firstpage').to.have.attribute('disabled')
        client.expect.element('.pagination-back').to.have.attribute('disabled')
        client.expect.element('.pagination-next').to.not.have.attribute('disabled')
      })

      it('Should limit search results per page', (client) => {
        client
          .url('http://127.0.0.1:5000/find?limit=50&q=Lord+of+the+rings')
          .waitForElementPresent('main', 5000)

        client.expect.element('.hit-item').to.be.present

        client.elements('css selector','.hit-item', (result) => {
          client.assert.equal(result.value.length, 50)
        })

        client
          .url('http://127.0.0.1:5000/find?limit=10&q=Lord+of+the+rings')
          .waitForElementPresent('main', 5000)

        client.elements('css selector','.hit-item', (result) => {
          client.assert.equal(result.value.length, 10)
        })
      })

      it('Should show message if no results were found', (client) => {
        client
          .url('http://127.0.0.1:5000/find?limit=50&p=prefLabel&q=invalidquery')
          .waitForElementPresent('main', 5000)

        client.expect.element('.no-results').to.be.present
      })

    })

    describe('Thing view', () => {

      it('Should load', (client) => {
        client
          .url('http://127.0.0.1:5000/auth/143787')
          .waitForElementPresent('main', 5000)
      })

      it('Should show a thing', (client) => {
        client.expect.element('.main-item').to.be.present
        client.expect.element('.main-item .thing-label').to.be.present
        client.expect.element('.main-item dl').to.be.present
      })

      it('Should show vocab popup on property click', (client) => {
        client.click('.main-item dl dt a', () => {
            client.expect.element('#embedvocab').to.be.visible.before(10000)
          })
      })

      it('Should show vocab popup on class click', (client) => {
        client.click('.main-item .panel-heading .label-class', () => {
            client.expect.element('#embedvocab').to.be.visible.before(5000)
          })
      })

      it('Should hide vocab popup on click outside popup', (client) => {
        client.click('footer .navbar-text', () => {
            client.expect.element('#embedvocab').to.not.be.visible.before(5000)
          })
      })

    })

    after((client, done) => {
      client.end(() => {
        done()
      })
    })

  })

})
