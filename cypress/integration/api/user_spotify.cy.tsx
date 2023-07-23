describe("/api/user/spotify | API Endpoint Test", () => {
  it("Should 400 requests that do not have a UID url param", () => {
    cy.request({
      method: "GET",
      url: "http://localhost:3000/api/user/spotify?",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it("Should 404 requests that do not have a VALID UID url param", () => {
    cy.request({
      method: "GET",
      url: "http://localhost:3000/api/user/spotify?uid=ThisIsAnInvalidUIDParam123",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
      cy.log(
        `Response (should have error message about how UID does not have an assosciated spotify account or UID is invalid:
        ${JSON.stringify(response.body)}`
      );
    });
  });
});
