// https://docs.cypress.io/api/introduction/api.html

describe('Cataloging a book', () => {
  context('desktop resolution', () => {
    beforeEach(() => {
      cy.viewport('macbook-15');
      cy.login();
    });

    it('Launch the site', () => {
      cy.visit('/');
      cy.contains('#service-name', 'Libris katalogisering');
    });

    it('Navigate to Create new page', () => {
      cy.get('.MainNav [href$="create"]').click();
      cy.get('.CreationCard').its('length').should('be.gte', 1);
    });

    it('Choose a template', () => {
      cy.get('.CreationCard-select.btn-primary').eq(2).click();
      cy.get('.Inspector').its('length').should('eql', 1);
    });

    it('Add and edit a string field', () => {
      const compareValue = 'this is an example text';
      cy.get('body').type('{alt}f');
      cy.focused().type('cataloguersNote');
      cy.get('.FieldAdderPanel-fieldList button').first().focus();
      cy.focused().type('{enter}'); // Choose the prop
      cy.focused().type(compareValue);
      cy.focused().type('{esc}'); // Close the panel
      cy.focused().blur();
      cy.get('#formPath-mainEntity\\.cataloguersNote\\[0\\] textarea').should('have.value', compareValue);
    });

    it('Remove a local entity', () => {
      cy.get('#formPath-mainEntity\\.hasTitle\\[0\\]').should('exist');
      // no unique identifier for remove button - get the aria-label (not ideal...)
      cy.get('#formPath-mainEntity\\.hasTitle\\[0\\] .EntityAction[aria-label="Ta bort"][tabindex]:not([tabindex="-1"])').click();
      cy.get('#formPath-mainEntity\\.hasTitle\\[0\\]').should('not.exist');
    });

    it('Add a linked entity', () => {
      cy.get('#formPath-mainEntity\\.instanceOf\\.subject\\[0\\]').should('not.exist');
      cy.get('#formPath-mainEntity\\.instanceOf\\.subject .EntityAdder [tabindex]:not([tabindex="-1"])').click();
      cy.focused().type('*');
      cy.get('.PanelSearch-listItem').first().find('button').click();
      cy.get('#formPath-mainEntity\\.instanceOf\\.subject\\[0\\]').should('exist');
    });
  });
});
