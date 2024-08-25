import React from "react";
import {Link, useParams} from "react-router-dom";

export const PreviewContainer = () => {
    let {type} = useParams();

    return (
        <main className="preview-page">
            <section className="cart">
                <h2>Cart</h2>
                <div className="order-summary">
                    <ul className="order-summary-list">
                        <li className="order-summary-list-list-item">
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwhBuujtnSRXUkYD6OuRkAkkdZnX3o8tY6FQ&s" className="order-summary-list-list-item-image" alt=""/>
                            <p className="order-summary-list-list-item-title">Vodafone</p>
                            <p className="order-summary-list-list-item-price">10.00</p>
                        </li>
                    </ul>
                </div>
                <div className="cart-footer">
                    <span className="cart-footer-label">Total:</span>
                    <span className="cart-footer-amount">10.00</span>
                    <Link to={`/checkout/${type}`}>
                        <p className="button">Continue to checkout</p>
                    </Link>
                </div>
            </section>
        </main>
    );
}
