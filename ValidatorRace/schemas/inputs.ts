// Тестові дані: валідне замовлення з карткою і невалідне (5 помилок).
export const valid = {
    firstName: "  Богдан ", lastName: "Наливайко", email: " bohdan@nby.shop ", phone: "+380501234567",
    city: "Харків", address: "Відділення №12", shipping: "nova_poshta", payment: "card",
    cardNumber: "4242 4242 4242 4242", cardExpiry: "12/29", cardCvc: "123",
};
export const invalid = {
    firstName: "Б", lastName: "Наливайко", email: "bohdan@", phone: "0501234567",
    city: "Харків", address: "Відділення №12", shipping: "nova_poshta", payment: "card",
    cardNumber: "4242 4242 4242 4241", cardExpiry: "12/29", cardCvc: "12",
};
