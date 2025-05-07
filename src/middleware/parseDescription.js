export default function parseDescription(req, res, next) {
  if (typeof req.body.description === "string") {
    try {
      req.body.description = JSON.parse(req.body.description);
    } catch (err) {
      return res.status(400).json({
        message: "الوصف المرسل غير صالح، يجب أن يكون مصفوفة نقاط بصيغة JSON.",
      });
    }
  }
  next();
}
