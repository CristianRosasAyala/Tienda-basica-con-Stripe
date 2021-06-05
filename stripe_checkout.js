import STRIPE_KEYS from "./stripe_keys.js";

const d = document, 
    $template = d.getElementById("template-card").content,
    $videoConsoles = d.querySelector(".videoConsoles"),
    fragment = document.createDocumentFragment();

let products, prices;
const headersOptions = { headers: {Authorization: `Bearer ${STRIPE_KEYS.secret_key}`}};

const moneyFormat = (number) => `$${number.slice(0, -2)}.${number.slice(-2)}`

Promise.all([
    fetch("https://api.stripe.com//v1/prices", headersOptions),
    fetch("https://api.stripe.com/v1/products", headersOptions)
]).then(res => Promise.all(res.map(el => el.json())))
.then(json => {
    prices = json[0].data;
    products = json[1].data;

    prices.forEach(el =>{
        let dataProduct = products.filter(product => product.id === el.product );
        console.log(dataProduct);
        $template.querySelector("img").setAttribute("src", dataProduct[0].images[0]);
        $template.querySelector("img").alt = dataProduct[0].name
        $template.querySelector("figcaption").textContent = 
        `${dataProduct[0].name} ${moneyFormat(el.unit_amount_decimal)} ${el.currency}`;
        $template.querySelector("figure").setAttribute('data-price', el.id)
        let clone = d.importNode($template, true);
        fragment.appendChild(clone);
    });
    $videoConsoles.appendChild(fragment);

    console.log(products);
    console.log(prices);

})
.catch(err => console.log(err));

d.addEventListener("click", e =>{
    if(e.target.matches(".card *")){
        let price = e.target.parentElement.getAttribute("data-price");
        Stripe(STRIPE_KEYS.public_key).redirectToCheckout({
            lineItems: [{price, quantity: 1}],
            mode: "subscription",
            successUrl: "http://127.0.0.1:5500/succes-Stripe.html",
            cancelUrl: "http://127.0.0.1:5500/cancel-Stripe.html",
        })
        .then(res =>{
            if(res.error){
                $videoConsoles.insertAdjacentElement("afterend", "OCURRIÓ UN ERROR "+res.error);
            }
        })
    }
})