// https://docs.cypress.io/api/introduction/api.html

describe('Search functionality', () => {
  context('desktop resolution', () => {
    beforeEach(() => {
      cy.viewport('macbook-15');
    });

    it('It\'s possible to do a default search and see results', () => {
      cy.visit('/');
      cy.get('.SearchBar-input input').focus().type('a').type('{enter}');
      cy.get('.SearchResult-list').find('.ResultItem').its('length').should('be.gte', 1);
    });

    it('It\'s possible to do a filtered search and see results', () => {
      cy.visit('/');
      cy.get('.SearchBar-typeButtons input').first().uncheck();
      cy.get('.SearchBar-typeButtons input').last().check();
      cy.get('.SearchBar-input input').focus().type('a').type('{enter}');
      cy.get('.SearchResult-list').find('.ResultItem').its('length').should('be.gte', 1);
    });
  });
});
