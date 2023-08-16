const mongoose = require("mongoose");
const Product = require("./product");
const { Schema } = mongoose;

const farmSchema = new Schema({
	name: {
		type: String,
		required: [true, "Farm must have a name!"],
	},
	city: { type: String },
	email: {
		type: String,
		required: [true, "Email required"],
	},
	products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
});

// farmSchema.pre("findOneAndDelete", async function () {//we don't have access to data in pre
// 	console.log("Pre middleware!!!");
// 	console.log(data);
// });
farmSchema.post("findOneAndDelete", async function (farm) {
	if (farm.products.length) {
		const res = await Product.deleteMany({ _id: { $in: farm.products } });
		console.log(res);
	}
	console.log("Post middleware!!!");
	console.log(farm);
});

//compile farm
const Farm = mongoose.model("Farm", farmSchema);

module.exports = Farm;
