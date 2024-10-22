// https://docs.cypress.io/api/introduction/api.html

describe('Opening and closing of panels', () => {
  context('desktop resolution', () => {
    beforeEach(() => {
      cy.viewport('macbook-15');
      cy.login();
    });

    it('... the field-adder panel', () => {
      cy.gotoNewDocument();
      cy.get('.Toolbar .FieldAdder button').click();
      cy.get('.PanelComponent.FieldAdderPanel').should('exist');
      cy.get('.PanelComponent .PanelComponent-windowControl i.fa-close').click();
      cy.get('.PanelComponent.FieldAdderPanel').should('not.exist');
      cy.get('body').type('{alt}f');
      cy.get('.PanelComponent.FieldAdderPanel').should('exist');
      cy.get('body').trigger('keydown', { keyCode: 27, which: 27 });
      cy.get('.PanelComponent.FieldAdderPanel').should('not.exist');
    });

    it('... the entiy-adder panel', () => {
      cy.get('#formPath-mainEntity\\.mediaType .EntityAdder').click();
      cy.get('.PanelComponent.EntityAdderPanel').should('exist');
      cy.get('.PanelComponent .PanelComponent-windowControl i.fa-close').click();
      cy.get('.PanelComponent.EntityAdderPanel').should('not.exist');
      cy.get('#formPath-mainEntity\\.mediaType .EntityAdder [tabindex]:not([tabindex="-1"])').as('EntityAdder');
      cy.get('@EntityAdder').focus();
      cy.get('@EntityAdder').type('{enter}', { force: true });
      cy.get('.PanelComponent.EntityAdderPanel').should('exist');
      cy.get('body').trigger('keydown', { keyCode: 27, which: 27 });
      cy.get('.PanelComponent.EntityAdderPanel').should('not.exist');
    });

    // TODO: fix test
    it('... the search-window panel', () => {
      // no unique identifier for link button - get the aria-label (not ideal...)
      cy.get('#formPath-mainEntity\\.instanceOf > .ItemLocal-heading .EntityAction[aria-label="Skapa/länka"][tabindex]:not([tabindex="-1"])')
        .as('LinkAction');
      cy.get('@LinkAction').click();
      cy.get('.PanelComponent.SearchWindowPanel').should('exist');
      cy.get('.PanelComponent .PanelComponent-windowControl i.fa-close').click();
      cy.get('.PanelComponent.SearchWindowPanel').should('not.exist');
      cy.get('@LinkAction').type('{enter}', { force: true });
      cy.get('.PanelComponent.SearchWindowPanel').should('exist');
      cy.get('body').trigger('keydown', { keyCode: 27, which: 27 });
      cy.get('.PanelComponent.SearchWindowPanel').should('not.exist');
    });
  });
});
