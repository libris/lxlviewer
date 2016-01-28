describe('LXL viewer', function() {

  describe('id.kb.se', function() {
    
    before(function(client, done) {
      done();
    });
    
    after(function(client, done) {
      client.end(function() {
        done();
      });
    });
    
    afterEach(function(client, done) {
      done();
    });
    
    beforeEach(function(client, done) {
      done();
    });
    
    describe('Index', function() {
      
      it('Should load', function(client) {
        client
          .url('http://localhost:5000/')
      })
      
      it('Should show 3 scheme links in the intro panel', function(client) {

        client.elements('css selector','main.container .intro-text .list-group-item', function (result) {
          client.assert.equal(result.value.length, 3);
        })
      });
      
      it('Should show 3 scheme panels', function(client) {

        client.elements('css selector','main.container .scheme-item', function (result) {
          client.assert.equal(result.value.length, 3);
        })
      });
      
    })
    
    describe('Collection view', function() {
      
      it('Should load', function(client) {
        client
          .url('http://localhost:5000/find?q=*&limit=50&inScheme.@id=https://id.kb.se/term/sao&@type=TopicalTerm')
          .waitForElementPresent('body', 10000)
          
          .expect.element('.no-results').to.not.be.present
        
      })
        
      it('Should have search controls', function(client) {
        
          client.expect.element('.pagination-firstpage').to.be.present
          client.expect.element('.pagination-back').to.be.present
          client.expect.element('.pagination-next').to.be.present
          
      });
      
      it('Should disable/enable pagination buttons when no destination', function(client) {
        client.expect.element('.pagination-firstpage').to.have.attribute('disabled')
        client.expect.element('.pagination-back').to.have.attribute('disabled')
        client.expect.element('.pagination-next').to.not.have.attribute('disabled')
      })
      
      it('Should limit search results per page', function(client) {
        
        client
          .url('http://localhost:5000/find?q=*&limit=50&inScheme.@id=https://id.kb.se/term/sao&@type=TopicalTerm')
          .waitForElementPresent('body', 10000)
        
        client
          .expect.element('.hit-item').to.be.present
        
        client.elements('css selector','.hit-item', function (result) {
          client.assert.equal(result.value.length, 50);
        })
          
        client
          .url('http://localhost:5000/find?q=*&limit=10&inScheme.@id=https://id.kb.se/term/sao&@type=TopicalTerm')
          .waitForElementPresent('body', 10000)
          
        client.elements('css selector','.hit-item', function (result) {
          client.assert.equal(result.value.length, 10);
        })
          
      });
      
      it('Should show message if no results were found', function(client) {
        client
          .url('http://localhost:5000/find?limit=50&p=prefLabel&q=invalidquery')
          .waitForElementPresent('body', 10000)
          
        client.expect.element('.no-results').to.be.present
      });
      
    })
    
    describe('Thing view', function() {
      
      it('Should load', function(client) {
        client
          .url('http://localhost:5000/term/sao/Kvinnor%C3%B6relsen')
          .waitForElementPresent('body', 10000)
      })
      
      it('Should show a thing', function(client) {
        client.expect.element('.main-item').to.be.present
        client.expect.element('.main-item .thing-label').to.be.present
        client.expect.element('.main-item dl').to.be.present
      });
      
      it('Should show vocab popup on property click', function(client) {
        client
        
          .click('.main-item dl dt a', function() {
            client.expect.element('#embedvocab').to.be.visible.before(5000)
          })
      });
      
      it('Should show vocab popup on class click', function(client) {
        client
        
          .click('.main-item .panel-heading .label-class', function() {
            client.expect.element('#embedvocab').to.be.visible.before(5000)
          })
      });
      
      it('Should hide vocab popup on click outside popup', function(client) {
        client
          .click('footer .navbar-text', function() {
            client.expect.element('#embedvocab').to.not.be.visible.before(5000)
          })
      });
      
    })
    
    describe('Marcframe view', function() {
      
      it('Should load', function(client) {
        client
          .url('http://localhost:5000/marcframeview/')
          .waitForElementPresent('body', 10000)
      })
        
      it('Sidenav Should show a menu of categories', function(client) {
        client
          .expect.element('.menu-col .nav-tabs').to.be.present
      });
      
      it('Sidenav Should initially show BIB fields', function(client) {
        client.expect.element('.menu-col .nav-tabs .active a').text.to.equal('bib')
        client.expect.element('#tab-bib').to.be.visible
        client.expect.element('#tab-auth').to.not.be.visible
        client.expect.element('#tab-hold').to.not.be.visible
      });
      
      it('Sidenav Should switch fields when another tab is clicked', function(client) {
        client.click('a[href="#tab-auth"]', function() {
          client.expect.element('#tab-bib').to.not.be.visible
          client.expect.element('#tab-auth').to.be.visible
          client.expect.element('#tab-hold').to.not.be.visible
        })
      });
      
    })
    
    describe('Vocab view', function() {
      
      it('Should load', function(client) {
        client
          .url('http://localhost:5000/def/terms.html')
          .waitForElementPresent('body', 10000)
      })
      
      it('Sidenav should show classes', function(client) {
        client.expect.element('.menu-col .nav-classes').to.be.present
      });
      
      it('Sidenav should show properties', function(client) {
        client.expect.element('.menu-col .nav-properties').to.be.present
      });
      
    })
    
  });
  
  describe('libris.kb.se', function() {
    
    before(function(client, done) {
      done();
    });
    
    after(function(client, done) {
      client.end(function() {
        done();
      });
    });
    
    afterEach(function(client, done) {
      done();
    });
    
    beforeEach(function(client, done) {
      done();
    });
    
    describe('Index', function() {
      
      it('Should load', function(client) {
        client
          .url('http://127.0.0.1:5000/')
      })
      
    })
    
    describe('Collection view', function() {
      
      it('Should load', function(client) {
        client
          .url('http://127.0.0.1:5000/find?limit=50&q=Lord+of+the+rings')
          .waitForElementPresent('body', 10000)
          
          .expect.element('.no-results').to.not.be.present
        
      })
        
      it('Should have search controls', function(client) {
        
          client.expect.element('.pagination-firstpage').to.be.present
          client.expect.element('.pagination-back').to.be.present
          client.expect.element('.pagination-next').to.be.present
          
      });
      
      it('Should disable/enable pagination buttons when no destination', function(client) {
        client.expect.element('.pagination-firstpage').to.have.attribute('disabled')
        client.expect.element('.pagination-back').to.have.attribute('disabled')
        client.expect.element('.pagination-next').to.not.have.attribute('disabled')
      })
      
      it('Should limit search results per page', function(client) {
        
        client
          .url('http://127.0.0.1:5000/find?limit=50&q=Lord+of+the+rings')
          .waitForElementPresent('body', 10000)
        
        client
          .expect.element('.hit-item').to.be.present
        
        client.elements('css selector','.hit-item', function (result) {
          client.assert.equal(result.value.length, 50);
        })
          
        client
          .url('http://127.0.0.1:5000/find?limit=10&q=Lord+of+the+rings')
          .waitForElementPresent('body', 10000)
          
        client.elements('css selector','.hit-item', function (result) {
          client.assert.equal(result.value.length, 10);
        })
          
      });
      
      it('Should show message if no results were found', function(client) {
        client
          .url('http://127.0.0.1:5000/find?limit=50&p=prefLabel&q=invalidquery')
          .waitForElementPresent('body', 10000)
          
        client.expect.element('.no-results').to.be.present
      });
      
    })
    
    describe('Thing view', function() {
      
      it('Should load', function(client) {
        client
          .url('http://127.0.0.1:5000/term/sao/Kvinnor%C3%B6relsen')
          .waitForElementPresent('body', 10000)
      })
      
      it('Should show a thing', function(client) {
        client.expect.element('.main-item').to.be.present
        client.expect.element('.main-item .thing-label').to.be.present
        client.expect.element('.main-item dl').to.be.present
      });
      
      it('Should show vocab popup on property click', function(client) {
        client
        
          .click('.main-item dl dt a', function() {
            client.expect.element('#embedvocab').to.be.visible.before(5000)
          })
      });
      
      it('Should show vocab popup on class click', function(client) {
        client
        
          .click('.main-item .panel-heading .label-class', function() {
            client.expect.element('#embedvocab').to.be.visible.before(5000)
          })
      });
      
      it('Should hide vocab popup on click outside popup', function(client) {
        client
          .click('footer .navbar-text', function() {
            client.expect.element('#embedvocab').to.not.be.visible.before(5000)
          })
      });
      
    })
    
  });

});
