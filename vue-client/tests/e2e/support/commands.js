// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('login', () => {
  cy.on('window:before:load', (win) => {
    // win.fetch = null;
  });
  window.localStorage.setItem('at', 'aRandomString');
  cy.fixture('userObject').then((json) => {
    cy.intercept(
      {
        method: 'GET',
        url: '**/oauth/verify',
      },
      json,
    ).as('getUser');
  });
});

Cypress.Commands.add('gotoNewDocument', () => {
  cy.visit('/create');
  cy.get('.CreationCard-select.btn-primary').eq(2).click();
});
