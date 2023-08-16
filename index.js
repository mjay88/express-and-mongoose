const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Product = require("./models/product");
const Farm = require("./models/farm");

mongoose
	.connect("mongodb://127.0.0.1:27017/farmStand3")
	.then(() => {
		console.log("MONGO CONNECTION OPEN!");
	})
	.catch((e) => {
		console.log("MONGO CONNECTION ERROR: ", e);
	});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//middlewares
//tell express to use middleware, so we can send post request
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
//dealing with 'selected'

//Farm routes
//get all farms
app.get("/farms", async (req, res) => {
	const farms = await Farm.find({});
	res.render("farms/index", { farms });
});
//serve farms form
app.get("/farms/new", (req, res) => {
	res.render("farms/new");
});
//post route for new farm
app.post("/farms", async (req, res) => {
	const farm = new Farm(req.body);
	await farm.save();
	res.redirect("/farms");
});
//show route has to come after new
app.get("/farms/:id", async (req, res) => {
	const farm = await Farm.findById(req.params.id).populate("products");
	res.render("farms/show", { farm });
});
//serve new form for products on a farm
app.get("/farms/:id/products/new", async (req, res) => {
	const { id } = req.params;
	const farm = await Farm.findById(id);
	res.render("products/new", { categories, farm });
});

app.post("/farms/:id/products", async (req, res) => {
	const { id } = req.params;
	const farm = await Farm.findById(id);
	const { name, price, category } = req.body;
	const product = new Product({ name, price, category });
	farm.products.push(product);
	product.farm = farm;
	await farm.save();
	await product.save();
	res.redirect(`/farms/${farm._id}`);
});

//delete farm
app.delete("/farms/:id", async (req, res) => {
	const farm = await Farm.findByIdAndDelete(req.params.id);

	res.redirect("/farms");
});

//product routes

const categories = ["fruit", "vegetable", "dairy", "mushrooms"];

//show all products route
app.get("/products", async (req, res) => {
	const { category } = req.query;
	if (category) {
		const products = await Product.find({ category: category });
		res.render("products/index", { products, category });
	} else {
		const products = await Product.find({});
		res.render("products/index", { products, category: "All" });
	}
	// console.log(products, "all products"); //shows up in terminal
	// res.render("products/index", { products });
});

//create new products routes, serve new products form
app.get("/products/new", (req, res) => {
	res.render("products/new", { categories });
});
//create new products post route
app.post("/products", async (req, res) => {
	const newProduct = new Product(req.body);
	await newProduct.save();
	console.log(newProduct);
	res.redirect(`/products/${newProduct._id}`);
});
//show route/dynamic route
app.get("/products/:id", async (req, res) => {
	//get the id
	const { id } = req.params;
	const product = await Product.findById(id).populate("farm", "name");
	console.log(product);
	res.render("products/show", { product });
});

//edit route
app.get("/products/:id/edit", async (req, res) => {
	const { id } = req.params;
	const product = await Product.findById(id);
	res.render("products/edit", { product, categories });
});
//edit route
app.put("/products/:id", async (req, res) => {
	const { id } = req.params;
	const product = await Product.findByIdAndUpdate(id, req.body, {
		runValidators: true,
		new: true,
	});
	console.log(req.body);
	res.redirect(`/products/${product._id}`);
});
//delete route
app.delete("/products/:id", async (req, res) => {
	const { id } = req.params;
	const deletedProduct = await Product.findByIdAndDelete(id);
	res.redirect("/products");
});

app.listen(3000, () => {
	console.log("APP IS LISTENING ON PORT 3000");
});
