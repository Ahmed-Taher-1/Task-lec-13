export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      const errors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] ?? "body";
        errors[field] ??= { errors: [] };
        errors[field].errors.push(issue.message);
      }
      return res.status(422).json({ errors });
    }

    req.validated = result.data;
    next();
  };
}
