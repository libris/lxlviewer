// https://docs.cypress.io/api/introduction/api.html

describe('Opening and closing of panels', () => {
  context('desktop resolution', () => {
    beforeEach(() => {
      cy.viewport('macbook-15');
    });

    it('... the remote databases panel', () => {
      cy.visit('/search/remote');
      cy.wait(100);
      cy.get('body').trigger('keydown', { keyCode: 27, which: 27 });
      cy.get('.PanelComponent').should('not.exist');
      cy.get('.RemoteDatabases-add').click();
      cy.get('.PanelComponent.RemoteDatabasesPanel').should('exist');
      cy.get('.PanelComponent .PanelComponent-windowControl i.fa-close').click();
      cy.get('.PanelComponent.RemoteDatabasesPanel').should('not.exist');
      cy.wait(100);
      cy.get('.RemoteDatabases-add').focus().trigger('keyup', { keyCode: 13, which: 13 });
      cy.get('.PanelComponent.RemoteDatabasesPanel').should('exist');
      cy.get('body').trigger('keydown', { keyCode: 27, which: 27 });
      cy.get('.PanelComponent.RemoteDatabasesPanel').should('not.exist');
    });
    
    it('... the field-adder panel', () => {
      cy.visit('/create');
      cy.get('.CreationCard-select.btn-primary').eq(2).click();
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
      cy.visit('/create');
      cy.get('.CreationCard-select.btn-primary').eq(2).click();
      cy.get('#formPath-mainEntity\\.mediaType .EntityAdder').click();
      cy.get('.PanelComponent.EntityAdderPanel').should('exist');
      cy.get('.PanelComponent .PanelComponent-windowControl i.fa-close').click();
      cy.get('.PanelComponent.EntityAdderPanel').should('not.exist');
      cy.get('#formPath-mainEntity\\.mediaType .EntityAdder [tabindex]:not([tabindex="-1"])').focus().trigger('keyup', { keyCode: 13, which: 13 });
      cy.get('.PanelComponent.EntityAdderPanel').should('exist');
      cy.get('body').trigger('keydown', { keyCode: 27, which: 27 });
      cy.get('.PanelComponent.EntityAdderPanel').should('not.exist');
    });

    it('... the search-window panel', () => {
      cy.visit('/create');
      cy.get('.CreationCard-select.btn-primary').eq(2).click();
      cy.get('#formPath-mainEntity\\.instanceOf .ItemSibling-action.LinkAction [tabindex]:not([tabindex="-1"])').click();
      cy.get('.PanelComponent.SearchWindowPanel').should('exist');
      cy.get('.PanelComponent .PanelComponent-windowControl i.fa-close').click();
      cy.get('.PanelComponent.SearchWindowPanel').should('not.exist');
      cy.get('#formPath-mainEntity\\.instanceOf .ItemSibling-action.LinkAction [tabindex]:not([tabindex="-1"])').focus().trigger('keyup', { keyCode: 13, which: 13 });
      cy.get('.PanelComponent.SearchWindowPanel').should('exist');
      cy.get('body').trigger('keydown', { keyCode: 27, which: 27 });
      cy.get('.PanelComponent.SearchWindowPanel').should('not.exist');
    });
  });
});
