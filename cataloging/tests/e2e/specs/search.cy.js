// https://docs.cypress.io/api/introduction/api.html

describe('Search functionality', () => {
  context('desktop resolution', () => {
    beforeEach(() => {
      cy.viewport('macbook-15');
    });

    it('It\'s possible to do a default search and see results', () => {
      cy.visit('/');
      cy.get('#searchForm .SearchForm-input').as('input');
      cy.get('@input').focus();
      cy.get('@input').type('a');
      cy.get('@input').type('{enter}');
      cy.get('.SearchResult-list').find('.ResultItem').its('length').should('be.gte', 1);
    });

    it('It\'s possible to do a filtered search and see results', () => {
      cy.visit('/');
      cy.get('#searchForm .hidden-xs .SearchForm-typeSelect').select('Concept');
      cy.get('#searchForm .SearchForm-input').as('input');
      cy.get('@input').focus();
      cy.get('@input').type('a');
      cy.get('@input').type('{enter}');
      cy.get('.SearchResult-list').find('.ResultItem').its('length').should('be.gte', 1);
    });
  });
});
