
describe('Tropical Stay', () => {

  it('Rent Action', () => {
    cy.visit('https://localhost:3000')
    cy.contains('Login').click()
    cy.wait(1000)
    cy.get('[aria-label="Scatter"]').click()
    cy.wait(2000)
    cy.get('.user-info-container').should('have.text', ' Signed in as example')

    cy.get('div[role=button].user-info-dropdown-btn').click()
    cy.get('[aria-label="Enable WebAuthn 2FA"]').click()
    cy.get('[aria-label="Enable WebAuthn 2FA"]').click()
    cy.wait(2500)
    cy.get('div[role=button].user-info-dropdown-btn').click()
    cy.get('.user-dropdown-item.menu-item-with-icon').first().should('have.text', 'WebAuthn 2FA Enabled!')

    cy.get('[aria-label="Search a Property Submit"]').click()
    cy.get('[aria-label="Rent Property Button"]').first().click()
    cy.wait(2000)
    cy.get('[aria-label="Rent Property Button"]').first().should('have.text', 'Renting')

    cy.get('[aria-label="Like Property Button"]').first().click()
    cy.wait(2000)
    cy.get('[aria-label="Like Property Button"]').first().should('have.text', 'Liked')
  })
})


