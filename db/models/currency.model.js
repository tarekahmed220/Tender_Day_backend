import mongoose, { Schema } from "mongoose";

const currencySchema = new Schema({
  AR: { type: String, required: true },
  EN: { type: String, required: true },
  symbol: { type: String, required: true },
});

const Currency = mongoose.model("Currency", currencySchema);

export default Currency;
