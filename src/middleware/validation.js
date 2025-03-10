export const validation = (schema) => {
  return (req, res, next) => {
    console.log(">>>>>>>", req);
    const { error } = schema.validate(
      { ...req.body, ...req.params },
      { abortEarly: false, errors: { label: "key" } }
    );

    if (error) {
      const errorMessages = error.details.map((err) => {
        if (err.message.includes("is required")) {
          return `يرجى إدخال ${err.context.label || err.path[0]}`;
        }
        return err.message;
      });

      return res.status(422).json({
        message: "يرجى إدخال البيانات الصحيحة",
        errors: errorMessages,
      });
    }

    next();
  };
};
