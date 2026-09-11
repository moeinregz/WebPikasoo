// controller

const getProducts = async (req,res) => {
    const products = await Product.find()
}

// Route

router.get("/", getProducts)

// server

app.use(get)
