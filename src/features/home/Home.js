import React, {useEffect} from "react";
import {Link} from "react-router-dom";
import {useDispatch} from "react-redux";
import {clearPaymentSession} from "../../app/paymentSlice";


export const Home = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(clearPaymentSession());
    }, [dispatch]);

    return (
        <div className="main-container">
            <div className="info">
                <ul className="integration-list">
                    <li className="integration-list-item">
                        <Link to="/preview/dropin" className="integration-list-item-link">
                            <div className="title-container">
                                <p className="integration-list-item-title">Drop-in</p>
                            </div>
                        </Link>
                    </li>
                    <li className="integration-list-item">
                        <Link to="/preview/card" className="integration-list-item-link">
                            <div className="title-container">
                                <p className="integration-list-item-title">Card</p>
                            </div>
                        </Link>
                    </li>
                    <li className="integration-list-item">
                        <Link to="/preview/ideal" className="integration-list-item-link">
                            <div className="title-container">
                                <p className="integration-list-item-title">iDEAL</p>
                            </div>
                        </Link>
                    </li>
                    <li className="integration-list-item">
                        <Link to="/preview/giropay" className="integration-list-item-link">
                            <div className="title-container">
                                <p className="integration-list-item-title">giropay</p>
                            </div>
                        </Link>
                    </li>
                    <li className="integration-list-item">
                        <Link to="/preview/dotpay" className="integration-list-item-link">
                            <div className="title-container">
                                <p className="integration-list-item-title">Dotpay</p>
                            </div>
                        </Link>
                    </li>
                    <li className="integration-list-item">
                        <Link to="/preview/eps" className="integration-list-item-link">
                            <div className="title-container">
                                <p className="integration-list-item-title">EPS</p>
                            </div>
                        </Link>
                    </li>
                    <li className="integration-list-item">
                        <Link to="/preview/directEbanking" className="integration-list-item-link">
                            <div className="title-container">
                                <p className="integration-list-item-title">Sofort</p>
                            </div>
                        </Link>
                    </li>
                    <li className="integration-list-item">
                        <Link to="/preview/bcmc" className="integration-list-item-link">
                            <div className="title-container">
                                <p className="integration-list-item-title">Bancontact card</p>
                            </div>
                        </Link>
                    </li>
                    <li className="integration-list-item">
                        <Link to="/preview/paysafecard" className="integration-list-item-link">
                            <div className="title-container">
                                <p className="integration-list-item-title">PaySafe card</p>
                            </div>
                        </Link>
                    </li>
                    <li className="integration-list-item">
                        <a href="/preview/klarna_paynow" className="integration-list-item-link">
                            <div className="title-container">
                                <p className="integration-list-item-title">Klarna - Pay now</p>
                            </div>
                        </a>
                    </li>
                    <li className="integration-list-item">
                        <a href="/preview/klarna" className="integration-list-item-link">
                            <div className="title-container">
                                <p className="integration-list-item-title">Klarna - Pay later</p>
                            </div>
                        </a>
                    </li>
                    <li className="integration-list-item">
                        <a href="/preview/klarna_account" className="integration-list-item-link">
                            <div className="title-container">
                                <p className="integration-list-item-title">Klarna - Slice it</p>
                            </div>
                        </a>
                    </li>

                </ul>
                <div className="mt-5">
                    <Link to="/cancel" className="button text-light">
                        Cancel and Refund a payment
                    </Link>
                </div>
            </div>
        </div>
    )
}
