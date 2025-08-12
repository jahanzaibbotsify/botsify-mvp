<template>
    <div v-if="loaded">
        <notifications group="notifications" position="top right" width="400" />

        <Head>
            <title>{{ $page.props.basetitle }} - Manage your Billing information</title>
        </Head>
        <div v-if="paymentDetails.unsubscribe_email && paymentDetails.unsubscribe_email.bounce == 1"
            class="alert alert-light-danger" role="alert">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="feather feather-x close" data-dismiss="alert">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            <button>
                <strong>Alert !</strong> Your Email is Bounced, You might miss some important Emails from Botsify,
                Change
                your Email to get updated with Platform
            </button>
        </div>
        <div class="row layout-spacing justify-content-md-left">
            <!--  justify-content-md-center  -->
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 layout-top-spacing">
                <div class="bio layout-spacing">
                    <div v-if="!paymentDetails.subscribed_main || paymentDetails.on_grace_period || (paymentDetails.subscription && paymentDetails.subscription.stripe_plan == 'Special-Plan')"
                        class="widget-content widget-content-area simple-tab">
                        <h3 style="font-size: 22px">Billing Information</h3>
                        <template
                            v-if="paymentDetails.user && paymentDetails.user.pricing_id == 2 && !(paymentDetails.subscription) && paymentDetails.before_trial_payment && !paymentDetails.on_grace_period">
                            <h3 class="mb-2">Provide your Payment Information to start your 14 days free trial</h3>
                            <p class="text-danger">You will be charged after Trial Period, you can cancel anytime during
                                Trial Period </p>
                        </template>
                        <div v-if="!paymentDetails.subscription || paymentDetails.on_grace_period"
                            class="alert alert-light-primary" role="alert">
                            <div class="media">
                                <div class="alert-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round" class="feather feather-alert-triangle">
                                        <path
                                            d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z">
                                        </path>
                                        <line x1="12" y1="9" x2="12" y2="13"></line>
                                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                    </svg>
                                </div>
                                <div class="media-body">
                                    <div class="alert-text">
                                        <p style="color: #484848;font-weight: 600;text-align: center;">You are on <a
                                                href="https://www.wildapricot.com/articles/mrg-grace-periods"
                                                target="_blank" style="text-decoration:underline;">grace period.</a> If
                                            you want to continue this service please subscribe again.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-7 col-sm-6">
                                <form action="javascript:void(0);">
                                    <label for="cardNumber2">Select Plan</label>
                                    <div class="form-group row">
                                        <div class="col-sm-4">
                                            <div class="checkbox green">
                                                <input type="radio" class="plan" name="plan_name"
                                                    :checked="subscriptionDetails.selected_plan === 'Personal-Plan'"
                                                    @change="selectPlan('Personal-Plan', 593118)">
                                                <label style="text-align: center; padding-top:0px">
                                                    <span class="top">Monthly</span>
                                                    Personal Plan <br> <span style="font-weight: 600;">$49/Month </span>
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-sm-4">
                                            <div class="checkbox green">
                                                <input type="radio" class="plan" name="plan_name"
                                                    :checked="subscriptionDetails.selected_plan === 'Professional-Plan'"
                                                    @change="selectPlan('Professional-Plan', 593120)">
                                                <label style="text-align: center; padding-top:0px">
                                                    <span class="top">Monthly</span>
                                                    Professional Plan <br><span
                                                        style="font-weight: 600;">$149/Month</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-sm-4">
                                            <div class="checkbox green">
                                                <input type="radio" class="plan" name="plan_name"
                                                    :checked="subscriptionDetails.selected_plan === 'Business-Plan'"
                                                    @change="selectPlan('Business-Plan', 593123)">
                                                <label style="text-align: center; padding-top:0px">
                                                    <span class="top">Monthly</span>
                                                    Business Plan<br><span style="font-weight: 600;">$499/Month</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group row">
                                        <div class="col-sm-4">
                                            <div class="checkbox blue">
                                                <input type="radio" class="plan" name="plan_name"
                                                    :checked="subscriptionDetails.selected_plan === 'Personal-Plan-Annual'"
                                                    @change="selectPlan('Personal-Plan-Annual', 593119)">
                                                <label style="text-align: center; padding-top:0px">
                                                    <span class="top">Annually</span>
                                                    Personal Plan <br> <span style="font-weight: 600;">$490/Year </span>
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-sm-4">
                                            <div class="checkbox blue">
                                                <input type="radio" class="plan" name="plan_name"
                                                    :checked="subscriptionDetails.selected_plan === 'Professional-Plan-Annual'"
                                                    @change="selectPlan('Professional-Plan-Annual', 593121)">
                                                <label style="text-align: center; padding-top:0px">
                                                    <span class="top">Annually</span>
                                                    Professional Plan <br> <span
                                                        style="font-weight: 600;">$1500/Year</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-sm-4">
                                            <div class="checkbox blue">
                                                <input type="radio" class="plan" name="plan_name"
                                                    :checked="subscriptionDetails.selected_plan === 'Business-Plan-Annual'"
                                                    @change="selectPlan('Business-Plan-Annual', 593122)">
                                                <label style="text-align: center; padding-top:0px">
                                                    <span class="top">Annually</span>
                                                    Business Plan <br><span style="font-weight: 600;">$4900/Year</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="cardNumber">CARD NUMBER</label>
                                        <input type="tel" class="form-control" id="cardNumber" name="cardNumber"
                                            placeholder="Valid Card Number" v-payment:formatCardNumber
                                            autocomplete="cc-number" v-model="stripeDetails.cardNumber" />
                                    </div>
                                    <div class="form-group">
                                        <label for="cardName">NAME ON CARD</label>
                                        <input type="tel" class="form-control" id="cardName" name="cardName"
                                            placeholder="Name on Card" autocomplete="cc-name"
                                            v-model="stripeDetails.cardName" />
                                    </div>
                                    <div class="row">
                                        <div class="col">
                                            <div class="form-group">
                                                <label for="cardExpiry"><span class="">EXP</span> DATE</label>
                                                <input type="tel" class="form-control" id="cardExpiry" name="cardExpiry"
                                                    placeholder="MM / YY" v-payment:formatCardExpiry
                                                    autocomplete="cc-exp" v-model="stripeDetails.cardExpiry" />
                                            </div>
                                        </div>
                                        <div class="col">
                                            <div class="form-group">
                                                <label for="cardCVC">CVV CODE</label>
                                                <input type="tel" class="form-control" id="cardCVC" name="cardCVC"
                                                    placeholder="CVC" v-payment:formatCardCVC autocomplete="cc-csc"
                                                    v-model="stripeDetails.cardCVC" />
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="couponCode">COUPON CODE</label>
                                        <input type="text" class="form-control" name="couponCode" id="coupon" value=""
                                            placeholder="Discount Coupon" v-model="stripeDetails.couponCode" />
                                    </div>
                                    <div class="text-center">
                                        <button v-if="!subscribing" type="button" id="subscribe-button"
                                            class="btn btn-primary" style="width: 180px;"
                                            @click="stripeSubscription">Subscribe Now</button>
                                        <button v-if="subscribing" id="subscribe-button" class="btn btn-primary"
                                            style="width: 180px;" disabled><i class="fa fa-spinner fa-pulse"></i>
                                            Processing</button>
                                        <p>Or</p>
                                        <span id="subscribe-with-paypal" class="btn btn-success"
                                            @click="payPalSubscription">Pay with <img
                                                src="http://www.stickpng.com/assets/images/580b57fcd9996e24bc43c530.png"
                                                alt="" style="width: 100px;"></span>
                                    </div>
                                    <div class="row" v-if="payment_errors != ''">
                                        <div class="col-xs-12">
                                            <p class="payment-errors">{{ payment_errors }}</p>
                                        </div>
                                    </div>
                                </form>
                                <br><br><br>
                            </div>
                            <div class="col-md-5 col-sm-6 mt-4">
                                <div id="personal_plan_points" class="advantages"
                                    v-if="subscriptionDetails.selected_plan === 'Personal-Plan' || subscriptionDetails.selected_plan === 'Personal-Plan-Annual'">
                                    <p><i class="fa fa-check"></i>2 Chatbots</p>
                                    <p><i class="fa fa-check"></i>5K Unique Users/Month</p>
                                    <p><i class="fa fa-check"></i>$10/1000 additional users</p>
                                    <p><i class="fa fa-check"></i>Unlimited Conversations</p>
                                    <p><i class="fa fa-check"></i>Unlimited Stories</p>
                                    <p><i class="fa fa-check"></i>Unlimited Forms</p>
                                    <p><i class="fa fa-check"></i>Unlimited Media Blocks</p>
                                    <p><i class="fa fa-check"></i>FB, Website, SMS</p>
                                    <p><i class="fa fa-check"></i>Message Scheduling</p>
                                    <p><i class="fa fa-check"></i>Basic Support</p>
                                    <p><i class="fa fa-check"></i>All Integerations</p>
                                    <p><i class="fa fa-check"></i>Access to all Botsify Resources</p>
                                    <p><i class="fa fa-check"></i>10 Hours of Chatbot Development Free Worth $100</p>
                                    <p><i class="fa fa-check"></i>1 Month Chat History</p>
                                </div>
                                <div id="professional_plan_points" class="advantages"
                                    v-if="subscriptionDetails.selected_plan === 'Professional-Plan' || subscriptionDetails.selected_plan === 'Professional-Plan-Annual'">
                                    <p><i class="fa fa-check"></i>5 Chatbots</p>
                                    <p><i class="fa fa-check"></i>15K Unique Users/Month</p>
                                    <p><i class="fa fa-check"></i>$10/1000 additional users</p>
                                    <p><i class="fa fa-check"></i>Unlimited Conversations</p>
                                    <p><i class="fa fa-check"></i>Unlimited Stories</p>
                                    <p><i class="fa fa-check"></i>Unlimited Forms</p>
                                    <p><i class="fa fa-check"></i>Unlimited Media Blocks</p>
                                    <p><i class="fa fa-check"></i>FB, Website, SMS</p>
                                    <p><i class="fa fa-check"></i>Message Scheduling</p>
                                    <p><i class="fa fa-check"></i>Basic Support</p>
                                    <p><i class="fa fa-check"></i>All Integerations</p>
                                    <p><i class="fa fa-check"></i>Access to all Botsify Resources</p>
                                    <p><i class="fa fa-check"></i>1-Chatbot development free worth $200/Month
                                        (Deployable Across All Platforms)</p>
                                    <p><i class="fa fa-check"></i>3 Months Chat History</p>
                                    <p><i class="fa fa-check"></i>Personal Onboarding Session</p>
                                </div>
                                <div id="whitelabel_partner_plan_points" class="advantages"
                                    v-if="subscriptionDetails.selected_plan === 'Whitelabel-Partner'">
                                    <p><i class="fa fa-check"></i>Cloud Hosted</p>
                                    <p><i class="fa fa-check"></i>Dedicated Support</p>
                                    <p><i class="fa fa-check"></i>Self Branding</p>
                                    <p><i class="fa fa-check"></i>Bot Analytics</p>
                                    <p><i class="fa fa-check"></i>Use Own SMTP</p>
                                    <p><i class="fa fa-check"></i>Botsify API</p>
                                    <p><i class="fa fa-check"></i>Unlimited Users</p>
                                    <p><i class="fa fa-check"></i>Unlimited Sub Accounts</p>
                                </div>
                                <div id="business_plan_points" class="advantages"
                                    v-if="subscriptionDetails.selected_plan === 'Business-Plan' || subscriptionDetails.selected_plan === 'Business-Plan-Annual'">
                                    <p><i class="fa fa-check"></i>20 Chatbots</p>
                                    <p><i class="fa fa-check"></i>Unlimited Users</p>
                                    <p><i class="fa fa-check"></i>Unlimited Conversations</p>
                                    <p><i class="fa fa-check"></i>Unlimited Stories</p>
                                    <p><i class="fa fa-check"></i>Unlimited Forms</p>
                                    <p><i class="fa fa-check"></i>Unlimited Media Blocks</p>
                                    <p><i class="fa fa-check"></i>FB, Website, SMS</p>
                                    <p><i class="fa fa-check"></i>Message Scheduling</p>
                                    <p><i class="fa fa-check"></i>24/7 Premium Support</p>
                                    <p><i class="fa fa-check"></i>Dedicated Account Manager</p>
                                    <p><i class="fa fa-check"></i>Bi-Weekly Reporting</p>
                                    <p><i class="fa fa-check"></i>Personal Onboarding Session</p>
                                    <p><i class="fa fa-check"></i>All Integerations</p>
                                    <p><i class="fa fa-check"></i>Access to all Botsify Resources</p>
                                    <p><i class="fa fa-check"></i>3-Chatbot development free worth $600/Month
                                        (Deployable Across All Platforms)</p>
                                    <p><i class="fa fa-check"></i>Monthly Team Meeting to Improve your Chatbots</p>
                                    <p><i class="fa fa-check"></i>Free Monthly Training Sessions / Webinar </p>
                                    <p><i class="fa fa-check"></i>Bi-Weekly Training of 1 Chatbot Free for 12 Months</p>
                                    <p><i class="fa fa-check"></i>Botsify API Access</p>
                                    <p><i class="fa fa-check"></i>Unlimited Chat History</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="widget-content widget-content-area">
                        <h3 class="">Billing Information</h3>
                        <div v-if="paymentDetails.subscription && paymentDetails.subscription.status == 'paused' && !ltd_deal"
                            class="alert alert-danger pause-btn ml-0" role="alert"> Your account cancellation request
                            has been received. Please check your email for further instructions. </div>
                        <template v-if="paymentDetails.subscription && paymentDetails.subscription.status == 'active'">
                            <p
                                v-if="paymentDetails.subscription && paymentDetails.subscription.stripe_id && (paymentDetails.subscription.stripe_id.indexOf('ltd-') != -1 || paymentDetails.subscription.stripe_plan.indexOf('LTD-') != -1)">
                                You are currently on <template
                                    v-if="paymentDetails.subscription && paymentDetails.subscription.stripe_id">{{ getSubscriptionPlan(paymentDetails.subscription.stripe_plan)}}</template>.
                            </p>
                            <p v-else>
                                You are currently on
                                <span v-if="paymentDetails.subscription.stripe_id">{{  getSubscriptionPlan(paymentDetails.subscription.stripe_plan) }}</span>
                                <template v-if="paymentDetails.subscription.paddle_checkout_id != null">Subscribed
                                    with paypal. 
                                    <template v-if="paymentDetails.paddle_user && paymentDetails.paddle_user.next_payment">
                                        Your next charge will be <br/> <strong> ${{paymentDetails.paddle_user.next_payment.amount}} </strong> on
                                        <strong> {{paymentDetails.paddle_user.next_payment.date}}.</strong>
                                    </template>
                                </template>
                                <template v-else>
                                    <span v-if="paymentDetails.user.card_last_four">with Card Information: **** **** ****
                                        {{ paymentDetails.user.card_last_four }}</span>
                                    <template
                                        v-if="paymentDetails.upcoming_invoice && paymentDetails.upcoming_invoice.total && this.user.subs && !this.user.subs.stripe_plan.includes('LTD') && showSubsBtns">
                                        Your next charge will be <br /> <strong>
                                            ${{ paymentDetails.upcoming_invoice.total / 100 }} </strong> on
                                        <strong> {{ paymentDetails.upcoming_invoice.next_payment_attempt }}.</strong>
                                    </template>
                                </template>
                            </p>
                            <div v-if="checkDealUser() && showSubsBtns">
                                <a class="btn btn-primary" href="#" @click="openChangePlanModal">Change Plan</a>
                                <a class="btn btn-success" href="#" @click="openChangePaymentModal">Change Payment
                                    Information</a>
                                <a class="btn btn-danger" href="#" @click="openCancellationModal">Cancel Plan</a>
                            </div>
                            <div class="mt-3" v-if="paymentDetails.subscription && paymentDetails.subscription.whitelabel_client">
                              <span>You currently have {{total_bots}} active bots out of {{allowedBots}} bots</span><br>
                              <span>You currently have {{totalUsers}} active users out of {{allowedUsers}} users</span>
                            </div>
                        </template>

                        <div class="bio-skill-box">
                            <div class="row">
                                <div class="col-xl-12 col-md-12 col-sm-12 col-12">
                                    <ul class="nav nav-tabs flex-column flex-sm-row text-center font-weight-bold"
                                        id="myTab" role="tablist">
                                        <template
                                            v-if="$page.props.auth_user.subs && $page.props.auth_user.subs.stripe_plan == 'Whitelabel-Partner'">
                                            <li class="flex-sm-fill nav-item" role="presentation">
                                                <a class="nav-link active" id="home-tab" data-toggle="tab" href="#home"
                                                    role="tab" aria-controls="home" aria-selected="true">Invoices</a>
                                            </li>
                                            <li class="flex-sm-fill nav-item" role="presentation">
                                                <a class="nav-link" id="upcoming-invoices" data-toggle="tab"
                                                    href="#upcomingInvoices" role="tab" aria-controls="upcomingInvoices"
                                                    aria-selected="false">Upcoming Invoices</a>
                                            </li>
                                        </template>
                                        <h4 v-else>Invoices</h4>
                                    </ul>
                                    <div class="tab-content" id="myTabContent">
                                        <div class="tab-pane fade show active" id="home" role="tabpanel"
                                            aria-labelledby="home-tab">
                                            <template
                                                v-if="paymentDetails.subscription && paymentDetails.subscription.subscription_plan_id">
                                                <div class="row mt-4">
                                                    <div v-for="(charge, inddex) in paymentDetails.charges"
                                                        class="col-md-6 mb-3" :key="inddex">
                                                        <div class="d-flex b-skills">
                                                            <div class="">
                                                                <h5>${{ chargedAmount(charge.amount) }}</h5>
                                                                <p>{{ chargedDate(charge.payout_date) }}</p>
                                                                <a v-if="charge.receipt_url" class="btn btn-primary"
                                                                    :href="charge.receipt_url" target="_blank">Get
                                                                    Invoice</a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </template>
                                            <template
                                                v-else-if="paymentDetails.charges.data && paymentDetails.charges.data.length > 0">
                                                <div class="row mt-4">
                                                    <template v-for="(charge, inddx) in paymentDetails.charges.data">
                                                        <div v-if="charge.paid && charge.amount != 100"
                                                            class="col-md-6 mb-3" :key="inddx">
                                                            <div class="d-flex b-skills">
                                                                <div style="width:100%;">
                                                                    <div style="display:inline-block">
                                                                        <h5>${{ chargedAmount(charge.amount / 100) }}
                                                                            <template v-if="charge.amount_refunded > 0">
                                                                                (Refunded:
                                                                                ${{ chargedAmount(charge.amount_refunded
                                                                                        / 100)
                                                                                }})
                                                                            </template>
                                                                        </h5>
                                                                        <p>{{ chargedDate(charge.created) }}</p>
                                                                        <p>{{ charge.status }}</p>
                                                                    </div>
                                                                    <div style="display: inline-block; float: right;">
                                                                        <form>
                                                                            <button class="btn btn-primary"
                                                                                type="button"
                                                                                @click="getInvoice(charge.invoice, charge)"
                                                                                data-toggle="modal"
                                                                                data-target="#invoiceModal">Get
                                                                                Invoice
                                                                            </button>
                                                                        </form>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </template>
                                                </div>
                                            </template>
                                            <template v-else>
                                                <div class="col-12 col-xl-12 col-lg-12">
                                                    <div class="d-flex justify-content-center b-skills pb-0"
                                                        style="box-shadow: none;">
                                                        <h5>No Past Invoices yet</h5>
                                                    </div>
                                                </div>
                                            </template>
                                        </div>
                                        <div class="tab-pane fade" id="upcomingInvoices" role="tabpanel"
                                            aria-labelledby="upcoming-invoices">
                                            <div v-if="$page.props.auth_user.subs && $page.props.auth_user.subs.next_charge_date"
                                                class="mt-3">
                                                <table class="table table-bordered font-weight-bold mb-1">
                                                    <thead class="thead-light">
                                                        <tr>
                                                            <th>Type</th>
                                                            <th>Price</th>
                                                            <th>Bots Count</th>
                                                            <th>Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr v-if="whatsapp_bots > 0">
                                                            <td>WhatsApp Bots</td>
                                                            <td>$75</td>
                                                            <td>{{ whatsapp_bots }}</td>
                                                            <td>${{ whatsapp_bots * 75 }}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Other Bots</td>
                                                            <td>$25</td>
                                                            <td>{{ total_bots }}</td>
                                                            <td>${{ total_bots * 25 }}</td>
                                                        </tr>
                                                    </tbody>
                                                    <tfoot>
                                                        <tr>
                                                            <td colspan="1">Total Billing</td>
                                                            <td colspan="3">${{ upcoming_charges }}</td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="1">Next Billing</td>
                                                            <td colspan="3" class="next-billing text-primary">You will
                                                                be charged ${{ upcoming_charges }} on
                                                                {{ $page.props.auth_user.subs.next_charge_date }}
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                                <small class="text-dark float-right">**Note: Please delete all your test
                                                    bots before the upcoming invoice date</small>
                                            </div>
                                            <div v-else class="col-12 col-xl-12 col-lg-12">
                                                <div class="d-flex justify-content-center b-skills pb-0"
                                                    style="box-shadow: none;">
                                                    <h5>No Upcoming Invoices yet</h5>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <div class="modal fade mt-5" id="invoiceModal" tabindex="-1" role="dialog" aria-labelledby="invoiceModalLabel"
            @close="invoiceDetails = ''">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span
                                aria-hidden="true">&times;</span></button>
                    </div>
                    <div class="modal-body">
                        <div class="container" style="text-align:center" v-if="invoiceDetails != ''">
                            <div class="row" style="background-color: rgb(246,249,252); padding-top:1%;">
                                <h3 style="color: rgb(82,95,127);">Receipt</h3>
                            </div>
                            <div class="row" style="background-color: rgb(0,140,221); padding:5%;">
                                <div class="col-sm-12">
                                    <h2 style="color:white; margin-bottom:12px;" class="text-center">
                                        ${{ chargedAmount(invoiceDetails.invoice.total / 100) }} at Botsify</h2>
                                </div>

                                <div class="col-sm-12 text-center">
                                    <img width="25%"
                                        :src="'/theme/images/card_brands/' + invoiceDetails.card_brand + '.png'"
                                        alt="">
                                    <span
                                        style="color:white; font-weight:bold; vertical-align: middle;">{{ invoiceDetails.last_four }}</span>
                                </div>
                            </div>
                            <div class="row" style="background-color: rgb(0,126,198); padding:5px; color:white;">
                                <div class="col-sm-6">
                                    {{ chargedDate(invoiceDetails.invoice.date) }}
                                </div>
                                <div class="col-sm-offset-3 col-sm-3">{{ invoiceDetails.invoice.receipt_number }}</div>
                            </div>
                            <div class="row">
                                <div class="col-sm-12">
                                    <table class="table">
                                        <thead>
                                            <tr style="color:rgb(119,133,140);">
                                                <td>Description</td>
                                                <td>Amount</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Subscription to {{ invoiceDetails.plan_name }}</td>
                                                <td>${{ chargedAmount(invoiceDetails.invoice.total / 100) }}</td>
                                            </tr>
                                            <tr>
                                                <td>&nbsp;</td>
                                                <td style="padding-top:0px;">
                                                    <table class="table">
                                                        <tbody>
                                                            <tr>
                                                                <td style="color:rgb(119,133,140);">Total</td>
                                                                <td>${{ chargedAmount(invoiceDetails.invoice.total /
                                                                        100)
                                                                }}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>Paid</td>
                                                                <td>${{ chargedAmount(invoiceDetails.invoice.total /
                                                                        100)
                                                                }}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                </div>
                            </div>
                            <div class="row">
                                <div class="col-sm-12 text-center">
                                    <p>Botsify Inc.</p>
                                    <p>35-2622383</p>
                                    <p>251 Little Falls Drive, Wilmington, New Castle County, Delaware 19808.</p>
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-center">
                            <div class="spinner-grow text-info align-self-center loader-lg"></div>
                        </div>
                    </div>
                    <!-- /.modal-content -->
                </div>
                <!-- /.modal-dialog -->
            </div>
        </div>
        <div class="modal fade mt-5" id="changePlanModalBilling" tabindex="-1" role="dialog"
            aria-labelledby="changePlanModalLabel">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span
                                aria-hidden="true">&times;</span></button>
                    </div>
                    <div class="modal-body">

                        <h1 class="text-center">Change Your Plan</h1>
                        <div class="m-changePlanBtn pb-3" v-if="!updating">
                            <div v-if="paymentDetails.subscription && paymentDetails.subscription.whitelabel_client">
                                <div v-for="(plan, index) in paymentDetails.plan">
                                    <a v-show="paymentDetails.subscription.stripe_plan != index" href="#"
                                        class="btn btn-outline-success btn-block"
                                        @click="upgradePlan(index, true)">{{ plan }}</a>
                                </div>
                            </div>
                            <div v-else>
                                <a v-show="paymentDetails.subscription && paymentDetails.subscription.stripe_plan == 'Personal-Plan-Annual'"
                                    href="#" class="btn btn-outline-success btn-block"
                                    @click="upgradePlan('Personal-Plan')">Monthly (
                                    Personal
                                    Plan ) <span>$49</span> /Month</a>
                                <a v-show="paymentDetails.subscription && paymentDetails.subscription.stripe_plan == 'Personal-Plan' "
                                    href="#" class="btn btn-outline-success btn-block update"
                                    @click="upgradePlan('Personal-Plan-Annual')">Annually (
                                    Personal Plan ) <span>$490</span> /Year</a>
                                <a v-show="paymentDetails.subscription && paymentDetails.subscription.stripe_plan != 'Professional-Plan'"
                                    href="#" class="btn btn-outline-success btn-block update"
                                    @click="upgradePlan('Professional-Plan')">Monthly
                                    (
                                    Professional Plan ) <span>$149</span> /Month</a>
                                <a v-show="paymentDetails.subscription && paymentDetails.subscription.stripe_plan != 'Professional-Plan-Annual'"
                                    href="#" class="btn btn-outline-success btn-block update"
                                    @click="upgradePlan('Professional-Plan-Annual')">Annually (
                                    Professional Plan ) <span>$1490</span> /Year</a>
                            </div>
                            <div class="mt-2" v-if="paymentDetails.subscription && paymentDetails.subscription.stripe_plan != 'Personal-Plan-Annual' && paymentDetails.subscription.stripe_plan != 'Personal-Plan'">
                              <span>If you want to downgrade plan please contact us</span>
                              <div class="text-center mt-4">
                                <a class="btn btn-primary" :href="(paymentDetails.user.whitelabel_client && 
                                                                   paymentDetails.user.whitelabel_client.whitelabel.smtp_email !== '') ? `mailto:${paymentDetails.user.whitelabel_client.whitelabel.smtp_email}` : 'mailto:team@botsify.com'">Contact Us</a>
                              </div>
                            </div>
                        </div>

                        <div v-else class="text-center">
                            <div class="spinner-grow text-info align-self-center loader-lg"></div>
                        </div>
                    </div>

                </div>
                <!-- /.modal-content -->
            </div>
            <!-- /.modal-dialog -->
        </div>
        <!-- /.modal -->

        <!-- Change Payment Modal -->
        <div class="modal fade mt-5" id="changePaymentModal" tabindex="-1" role="dialog"
            aria-labelledby="changePaymentModalLabel">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title">Billing Information</h4>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span
                                aria-hidden="true">&times;</span></button>
                    </div>
                    <div class="modal-body col-xs-12">
                        <div class="card-info px-2">
                            <form @submit.prevent="updateCardDetails">
                                <div class="form-group">
                                    <label class="required-label" for="cardNumber">CARD NUMBER</label>
                                    <input type="tel" class="form-control" id="cardNumber" name="cardNumber"
                                        placeholder="Valid Card Number" v-payment:formatCardNumber
                                        autocomplete="cc-number" v-model="stripeDetails.cardNumber" />
                                </div>
                                <div class="row">
                                    <div class="col">
                                        <div class="form-group">
                                            <label class="required-label" for="cardExpiry"><span class="">EXP</span> DATE</label>
                                            <input type="tel" class="form-control" id="cardExpiry" name="cardExpiry"
                                                placeholder="MM / YY" v-payment:formatCardExpiry autocomplete="cc-exp"
                                                v-model="stripeDetails.cardExpiry" />
                                        </div>
                                    </div>
                                    <div class="col">
                                        <div class="form-group">
                                            <label class="required-label" for="cardCVC">CVV CODE</label>
                                            <input type="tel" class="form-control" id="cardCVC" name="cardCVC"
                                                placeholder="CVC" v-payment:formatCardCVC autocomplete="cc-csc"
                                                v-model="stripeDetails.cardCVC" />
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                  <label class="required-label" for="cardName">NAME ON CARD</label>
                                  <input type="tel" class="form-control" id="cardName" name="cardName"
                                         placeholder="Name on Card" autocomplete="cc-name"
                                         v-model="stripeDetails.cardName" />
                                </div>
                                <div class="form-group">
                                    <label for="couponCode">COUPON CODE</label>
                                    <input type="text" class="form-control" name="couponCode" id="coupon" value=""
                                        placeholder="Discount Coupon" v-model="stripeDetails.couponCode" />
                                </div>
                                <div v-if="paymentDetails.plan && (!paymentDetails.subscribed_main) || paymentDetails.on_grace_period"
                                    class="form-horizontal">
                                    <label for="amount2">Amount</label>
                                    <div class="col-xs-12 px-0 mb-2">
                                        <input type="text" class="form-control" v-model="stripeDetails.amount"
                                            id="amount2" readonly />
                                    </div>
                                </div>
                                <button v-if="!subscribing" type="submit" id="changeCardBtn"
                                    class="btn btn-primary text-uppercase w-100 mt-2">Update Information</button>
                                <button v-if="subscribing" id="changeCardBtn"
                                    class="btn btn-primary text-uppercase w-100 mt-2" disabled><i
                                        class="fa fa-spinner fa-pulse"></i> Processing</button>

                                <div class="row mt-2" v-if="payment_errors">
                                    <div class="col">
                                        <p class="payment-errors"></p>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div class="modal-footer clear">
                        <div class="card-icons text-left px-2 mt-3">
                            <img src="/theme/images/paymenticons/visa.png">
                            <img src="/theme/images/paymenticons/paypal.png">
                            <img src="/theme/images/paymenticons/union pay.png">
                            <img src="/theme/images/paymenticons/discover.png">
                            <img src="/theme/images/paymenticons/mastercard.png">
                            <img src="/theme/images/paymenticons/american express.png">
                            <img src="/theme/images/paymenticons/diners club.png">
                        </div>
                    </div>
                </div>
                <!-- /.modal-content -->
            </div>
            <!-- /.modal-dialog -->
        </div>



        <div class="modal fade mt-5" id="cancellationModal" tabindex="-1" role="dialog" aria-labelledby="cancellationModalLabel">
            <div class="modal-dialog" role="document"  style="max-width: 32rem!important;">
                <div class="modal-content">
                    <div class="modal-header justify-content-center border-bottom py-3">
                        <img
                            src="https://botsify.com/assets/img/logos/logo/logo-color.webp"
                            alt="Logo"
                            class="img-fluid"
                            style="height: 24px;"
                        />
                        </div>

                    <div class="modal-body">
                        <div class="pt-3 px-4 pb-4">
                            <div class="row">
                                <p class="title">Why are you cancelling?</p>
                                <div class="col-sm-12">
                                    <div v-for="(reason, index) in cancelReasons" :key="index" class="reasons">
                                    <label>
                                        <input
                                        type="radio"
                                        :value="reason.key"
                                        v-model="selectedCancelReason"
                                        class="form-check-input me-2"
                                        />
                                        {{ reason.label }}
                                    </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer justify-content-center pt-3 pb-2">
                        <button type="button" class="btn btn-dark" @click="toggleCancelPlanModal" :disabled="!selectedCancelReason">Submit</button>
                    </div>
                    <!-- /.modal-content -->
                </div>
                <!-- /.modal-dialog -->
            </div>
        </div>
    </div>
</template>

<script>
import moment from 'moment'
import VueStripePayment from 'vue-stripe-payment';

export default {
    props: [
        'isAppsumo',
    ],
    data() {
        return {
            whitelabel: null,
            isWhitelabel: false,
            data: {
                isAppsumo: this.$page.props.appsumo_user,
                whitelabelStripeAccount: null,
                lang: 'en',
            },
            paymentDetails: {},
            instantCancel: {
                service: "",
                rating: 10,
                suggestion: "",
                agree: "",
            },
            ltd_deal: false,
            clientSecret: '',
            stripeDetails: {
                cardNumber: "",
                cardName: "",
                cardExpiry: "",
                cardCVC: "",
                couponCode: ""
            },
            fields: {},
            errors: {},
            success: false,
            loaded: false,
            avatar: {},
            source: {},
            rating: 10,
            subscriptionDetails: {
                selected_plan: 'Personal-Plan',
                product_code: 593118
            },
            subscribing: false,
            payment_errors: '',
            updating: false,
            invoiceDetails: '',
            scripts: [
                "/theme/intl_tel_input/js/intlTelInput.js",
                "https://js.stripe.com/v2",
                "https://js.stripe.com/v3",
                "https://cdn.paddle.com/paddle/paddle.js"
            ],
            total_bots: 0,
            whatsapp_bots: 0,
            upcoming_charges: 0,
            hasCancelled: false,
            ltdPrice: '',
            showSubsBtns: true,
            allowedBots: 0,
            allowedUsers: 0,
            totalUsers: 0,
            cancelReasons: [
                { key: 'difficult_to_use', label: 'Difficult to use' },
                { key: 'expensive', label: 'Do you think it’s expensive?' },
                { key: 'dont_need', label: 'Don’t need it' },
                { key: 'not_achieving_goal', label: 'Not able to achieve your goal?' },
            ],
            selectedCancelReason: '',
        }
    },
    computed: {
        user() {
            return this.$page.props.auth_user;
        },

        paddleUser() {
            return (this.user && this.user.subs.stripe_id != null && this.user.subs.paddle_cancel_url != null);
        }
    },

    beforeMount() {
        this.loadScripts();
    },
    mounted() {
        this.getUserDetail();
        this.stripeClientSecret();
        $('#invoiceModal').on('hidden.bs.modal', (e) => {
            this.invoiceDetails = '';
        });
        let ltd = new URLSearchParams(window.location.search).get('utm_deal');
        if (ltd != null) {
            this.ltd_deal = true;
        }
        if(this.paymentDetails.paddle_user != null && this.paymentDetails.stripe_subscription != null){
           window.location.href = '/';
        }
    },
    created() {
        window.addEventListener("load", this.loadl)
    },
    destroyed() {
        window.removeEventListener("load", this.load);
        $(".widget-content-area").css('box-shadow', 'none');
    },
    methods: {
        loadScripts() {
            this.scripts.forEach((scriptLink) => {
                let recaptchaScript = document.createElement('script')
                recaptchaScript.setAttribute('src', scriptLink);
                document.head.appendChild(recaptchaScript)
            });
        },

        getSubscriptionPlan(plan) {
            if (this.paymentDetails.plan && this.paymentDetails.plan[plan] !== undefined ) {
              const planName = this.paymentDetails.plan[plan]
              return planName.substring(0, planName.indexOf('- $')).trim();
            }
            return plan.replace(/-/g, ' ');
        },

        getLTDUser() {
            if (this.paymentDetails.subscription.stripe_id.indexOf('ltd-') == -1)
                return false;

            return true;
        },

        getBFCMUser() {
            if (this.paymentDetails.subscription.stripe_plan.indexOf('BFCM') == -1)
                return false;

            return true;
        },

        getUserDetail() {
            this.updating = true;
            axios.get('/get-user-detail').then(response => {
                this.paymentDetails = response.data;
                this.isWhitelabel = response.data.isWhitelabel;
                this.whitelabel = response.data.whitelabel;
                // for whitelabel client
                if(this.$page.props.auth_user.subs && this.$page.props.auth_user.subs.whitelabel_client) {
                  this.allowedBots = response.data.allowed_bots;
                  this.allowedUsers = response.data.allowed_users;
                  this.total_bots = response.data.total_bots;
                  this.totalUsers = response.data.total_users;
                }

                if (this.$page.props.auth_user.subs && this.$page.props.auth_user.subs.stripe_plan == 'Whitelabel-Partner') {
                    this.whatsapp_bots = response.data.whatsapp_bots;
                    this.upcoming_charges = ((this.total_bots * 25) + (this.whatsapp_bots * 75))
                }

                if (!this.loaded) this.loaded = true;
            }).catch((error) => {
                console.error(error, "user detail");
            });
            this.updating = false;
        },

        stripeClientSecret() {
            axios.post('/account/stripe_client_secret').then((response) => {
                this.clientSecret = response.data.setup_intent.client_secret;
            })
        },
        getInvoice(id, charge) {
            axios.post('/payment/generate-invoice', { 'id': id, 'charge': JSON.stringify(charge) }).then((response) => {
                this.invoiceDetails = response.data.invoice;
            })
        },

        chargedAmount(number) {
            return number.toFixed(2);
        },

        chargedDate(date) {
            var check = moment.unix(date);
            if (!check._isValid) {
                return moment(date).format('MMMM D, YYYY')
            }
            return moment.unix(date).format('MMMM D, YYYY')
        },

        selectPlan(plan, code) {
            this.subscriptionDetails.selected_plan = plan;
            this.subscriptionDetails.product_code = code;
        },
        checkDealUser() {
            let stripePlan = this.paymentDetails.subscription.stripe_plan.toLowerCase();
            let stripeId = this.paymentDetails.subscription.stripe_id.toLowerCase();
            if (stripeId.indexOf('ltd-') == -1 && stripePlan.indexOf('bfcm') == -1 && stripePlan.indexOf('ltd-') == -1 && stripePlan.indexOf('-ltd') == -1) {
                return true;
            }
            return false;
        },
        payPalSubscription() {
            Paddle.Setup({
                vendor: 40322
            });
            // Open Paddle Payment
            Paddle.Checkout.open({
                product: this.subscriptionDetails.product_code,
                email: this.paymentDetails.user.email
            });
        },

        stripeSubscription() {
            if (this.stripeDetails.cardNumber == "" || this.stripeDetails.cardName == "" || this.stripeDetails.cardExpiry == "" || this.stripeDetails.cardCVC == "") {
                this.notify('error', 'Error', 'Please Fill All Details')
                return;
            }
            this.subscribing = true;

            let stripe = Stripe(this.stripeKey());
            Stripe.setPublishableKey(this.stripeKey());
            let expiry = this.stripeDetails.cardExpiry.split('/');
            let ccData = {
                number: this.stripeDetails.cardNumber, name: this.stripeDetails.cardName, cvc: this.stripeDetails.cardCVC, exp_month: parseInt(expiry[0]), exp_year: parseInt(expiry[1])
            };

            axios.post('/account/stripe_payment_method', { card: ccData, coupon: this.stripeDetails.couponCode }).then((response) => {
                if (response.data.status == "error") {
                    this.subscribing = false;
                    this.payment_errors = response.data.message;
                } else {
                    this.checkIf3dRequired(stripe, this.clientSecret, response.data.payment_method.id, response.data.card_token.id);
                }
            }).catch((error) => {
                console.log(error);
                this.subscribing = false;
            });
        },

        updateCardDetails() {
            this.payment_errors = '';
            if (this.stripeDetails.cardNumber == "" || this.stripeDetails.cardName == "" || this.stripeDetails.cardExpiry == "" || this.stripeDetails.cardCVC == "") {
                this.notify('error', 'Error', 'Please Fill All Details')
                return;
            }
            this.subscribing = true;
            let stripe = Stripe(this.stripeKey());
            Stripe.setPublishableKey(this.stripeKey());
            let expiry = this.stripeDetails.cardExpiry.split('/');
            let ccData = {
                number: this.stripeDetails.cardNumber, name: this.stripeDetails.cardName, cvc: this.stripeDetails.cardCVC, exp_month: parseInt(expiry[0]), exp_year: parseInt(expiry[1])
            };
            Stripe.card.createToken(ccData, (status, response) => {
                if (response.error) {
                    this.subscribing = false;
                    this.payment_errors = response.data.message;
                } else {

                    var token2 = response.id;
                    // AXIOS - you would send 'token' to your server here.
                    axios.post('/change/card', {
                        token: token2,
                        plan: this.subscriptionDetails.selected_plan,
                        coupon: this.stripeDetails.couponCode,
                        card: ccData
                    })
                        .then((response) => {
                            this.payment_errors = '';
                            if (response.data.status == 'success') {
                                this.subscribing = false;
                                this.notify('success', 'Success', 'Successfully Updated');
                                $('#changePaymentModal').modal('hide');
                                this.getUserDetail();
                            }
                            else {
                                this.subscribing = false;
                                this.notify('error', 'Error', 'Unable To Update Card Information');
                            }
                        })
                        .catch((error) => {
                            this.subscribing = false;
                            $('#changePaymentModal').modal('hide');
                            this.notify('error', 'Error', 'Unable to update card details');
                        });
                }
            });
        },

        checkIf3dRequired(stripe, clientSecret, payment_method_id, card_token, plan) {
            var modalOpened = false;
            stripe.confirmSetupIntent(
                clientSecret,
                {
                    payment_method: payment_method_id,
                }
            ).then((result) => {
                if (result.error) {
                    var err = result.error;
                    var message = err.code;
                    this.subscribing = false;
                    if (err.code == "card_declined") {
                        message = "Your card was declined. Your request was in live mode, but used a known test card.";
                    }
                    /* Show Stripe errors on the form */
                    this.payment_errors = message;
                } else {
                    // Handle result.error or result.setupIntent
                    var status = result.setupIntent.status;
                    return this.handleSetupCard(stripe, clientSecret, payment_method_id, card_token, plan, (status == 'requires_action') ? true : false);
                }
            }).catch((error) => {
                console.log("Confirmation Failed", error);
            });
        },

        storeSecureModalOpenForUser() {
            $.post('/account/stripe_secure_modal_open', {})
                .done(function (data, textStatus, jqXHR) {
                })
                .fail(function (jqXHR, textStatus, errorThrown) { console.log(textStatus, errorThrown); });
        },

        // Open Authorization/Authentication 3d-secure modal/pop-up
        handleSetupCard(stripe, clientSecret, payment_method_id, card_token, plan, modalOpened) {
            if (modalOpened) {
                this.storeSecureModalOpenForUser();
                stripe.handleCardSetup(
                    clientSecret, {
                    payment_method: payment_method_id,
                }
                ).then((response) => {
                    if (response.error) {
                        // Display error.message in your UI.
                        this.subscribing = false;
                        /* Show Stripe errors on the form */
                        this.payment_errors = response.error.message;
                    } else {
                        /* Visual feedback */
                        this.subscribing = true;
                        /* Hide Stripe errors on the form */
                        this.payment_errors = '';

                        // The setup has succeeded. Display a success message.
                        return this.storeSubscription(payment_method_id, stripe, card_token, plan, true);
                    }
                });
            } else {
                return this.storeSubscription(payment_method_id, stripe, card_token, plan, false);
            }
        },

        storeSubscription(payment_method_id, stripe, card_token, plan, modal_status) {
            axios.post('/account/stripe_card_token', {
                modal_opened: modal_status,
                type: 'restart',
                payment_method: payment_method_id, plan: this.subscriptionDetails.selected_plan, coupon: this.stripeDetails.couponCode
            })
                .then((response) => {
                    this.subscribing = false;
                    if (response.data.status == 'success') {
                        this.notify('success', 'Success', 'Successfully Completed');
                        this.getUserDetail();
                    } else {
                        this.notify('error', 'Error', response.data.message);
                    }
                })
                .catch((error) => {
                    this.subscribing = false;
                    /* Show Stripe errors on the form */
                    this.payment_errors = 'Try refreshing the page and trying again';
                });
        },

        openChangePlanModal() {
            $('#changePlanModalBilling').modal('show');
        },

        openChangePaymentModal() {
            $('#changePaymentModal').modal('show');
        },
        openCancellationModal() {
            $('#cancellationModal').modal('show');
        },
        upgradePlan(plan, isWlClient = false) {
            if (this.paddleUser) {
                this.updatePaddlePlan(plan, isWlClient);
            } else {
                this.updateStripePlan(plan, isWlClient);
                // this.changePlan(plan, 'stripe', isWlClient)
            }
        },
        changePlan(plan, provider = 'stripe', isWLClient) {
            swal({
                title: "Are you sure?",
                text: "Do you really want to change your plan? You will be charged balanced amount immediately.",
                showCancelButton: true,
                confirmButtonText: 'Yes, please',
                cancelButtonText: 'No',
                animation: false,
            })
                .then((response) => {
                    if (response.value) {
                        axios.post(`/change/plan`, { plan: plan, provider: provider, is_wl_client: isWLClient }).then((response) => {
                            $('#changePlanModalBilling').modal('hide');
                            if (response.data.status == 'success') {
                                this.notify('success', 'Success', 'Plan has been updated successfully');
                            } else {
                                this.notify('error', 'Error', response.data.message);
                            }
                            this.updating = false;
                            this.getUserDetail();
                        });
                    }
                    else {
                        $('#changePlanModalBilling').modal('hide');
                        this.updating = false;
                    }
                }).catch((error) => {
                    this.updating = false;
                    this.notify('error', 'Error', 'Some issue occured while checking payment, please try again later');
                })
        },

        updatePaddlePlan(plan, isWLClient) {
            this.updating = true;
            this.changePlan(plan, 'paddle', isWLClient);
        },

        updateStripePlan(plan, isWLClient) {
            this.updating = true;
            axios.post('/check/payment').then((response) => {
                if (response.data.status == 'success') {
                    this.changePlan(plan, 'stripe', isWLClient);
                } else {
                    this.updating = false;
                    this.notify('error', 'Error', 'Some issue occured while checking payment, please try again later');
                }
            }).catch((error) => {
                this.updating = false;
                this.notify('error', 'Error', 'Some issue occured while checking payment, please try again later');
            })
        },

        upgradeToLifeTime() {
            this.updating = true;
            swal({
                title: "Are you sure?",
                text: "You are unlocking the life time deal and this action is not revertable",
                showCancelButton: true,
                confirmButtonText: 'Yes, please',
                cancelButtonText: 'No',
                animation: false,
            })
                .then((response) => {
                    if (response.value) {
                        axios.post('/update-ltd', { 'plan': 'LTD-Exclusive' }).then((response) => {
                            if (response.data.status == 'success') {
                                this.notify('success', 'Success', 'Great! You have successfully unlocked the deal');
                            } else {
                                this.notify('error', 'Error', response.data.message);
                            }
                            this.updating = false;
                            this.getUserDetail();
                        }).catch((error) => {
                            this.updating = false;
                            this.notify('error', 'Error', 'Some issue occured while updating plan, please try again later');
                        });
                    }
                    else {
                        this.updating = false;
                    }
                });
        },
        toggleCancelPlanModal() {
            $('#cancellationModal').modal('hide');
            if(this.$page.props.auth_user.subs && this.$page.props.auth_user.subs.whitelabel_client){
              return this.cancelClientPlan();
            }
            var hmacCode = document.querySelector('meta[name="hmac-code"]').content;
            var hmacEnv = document.querySelector('meta[name="hmac-env"]').content;
            if(hmacCode && hmacEnv && this.user.stripe_id.includes('cus_')) {
                window.churnkey.init('show', {
                    customerId: this.user.stripe_id,
                    authHash: hmacCode,
                    appId: '1i58dfzbt',
                    mode: hmacEnv,
                    provider: 'stripe',
                    customerAttributes: {
                        'primary_reason': this.selectedCancelReason,
                    },
                });
            } else if(hmacCode && hmacEnv && this.user.subs ) {
                window.churnkey.init('show', {
                    customerId: this.user.subs.stripe_id,
                    subscriptionId: this.user.subs.stripe_id,
                    authHash: hmacCode,
                    appId: 'wtjy7tysa',
                    mode: hmacEnv,
                    provider: 'paddle',
                    customerAttributes: {
                        'primary_reason': this.selectedCancelReason,
                    },
                });
            }
        },
        cancelClientPlan(){
          swal({
              title: "Are you sure?",
              text: "Your subscription will be cancelled.",
              showCancelButton: true,
              confirmButtonText: 'Yes, please',
              cancelButtonText: 'No',
              animation: false,
          })
          .then((response) => {
              if (response.value) {
                  axios.post('/cancel-client-plan').then((response) => {
                      swal({
                          title: "Successful",
                          text: "Your account subscription has been cancelled",
                          type: "success",
                          confirmButtonColor: "#DD6B55",
                          confirmButtonText: "Close",
                      });
                      window.location.href = '/logout';
                  }).catch((error) => {
                    this.notify('error', 'Error', 'Unable to cancel your plan, please contact the support team for this issue')
                  });
              }
          });
        },
        cancelPlan() {
            this.hasCancelled = true;
            axios.post('/cancel-plan', {
                'user_form': this.instantCancel,
            }
            ).then((response) => {
                this.toggleCancelPlanModal();
                swal({
                    title: "Successful",
                    text: "Your account cancellation request has been received. Please check your email for further instructions.",
                    type: "success",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Close",
                });
                window.location.href = '/logout';
            });
            return;
        },
    }
}

</script>

<style scoped>
@import url('/theme/css/account-setting.css');
@import url('/theme/css/user-profile.css');

.table>tbody>tr>td:nth-child(n+2),
.table>tfoot>tr>td:nth-child(n+2) {
    text-align: right;
}

.user-profile .widget-content-area h3::after {
    width: 30px;
    bottom: 0px;
    left: 3px;
}

.next-billing {
    font-size: 16px;
}

#unsubscribe-form label {
    font-size: 14px;
}

.title {
    font-size: 1.25rem;
    line-height: 2.25rem;
    font-weight: 700;
    --tw-text-opacity: 1;
    color: rgba(29, 31, 39, var(--tw-text-opacity));
    margin-bottom: 0.75rem;
    line-height: 2rem;
}

.reasons {
    font-size: 1.125rem;
    line-height: 1.75rem;
    --tw-text-opacity: 1;
    color: rgba(75, 85, 99, var(--tw-text-opacity));
    padding-right: 1.5rem;
    line-height: 1.5rem;
}

.btn-dark{
    background-color: #000 !important;
    padding-left: 2.5rem !important;
    padding-right: 2.5rem !important;
    border-radius: .375rem !important;
    font-weight: 700 !important;
}
</style>