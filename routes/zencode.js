module.exports = ({
  Zencode,
  router,
  authMiddleware,
  asyncMiddleware,
  getConfig,
  handleResponse,
  handleError,
}) => {

  router.get(
    '/zencode/job.:ext?',
    authMiddleware,
    asyncMiddleware(async (req, res) => {
      const zencode = new Zencode(await getConfig(req.session.slug));

      try {
        handleResponse(req, res, await zencode.getJob(req.query.id));
      } catch (error) {
        handleError(req, res, error);
      }
    })
  );

};
