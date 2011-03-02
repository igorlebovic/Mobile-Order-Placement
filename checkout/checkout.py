from speeqeweb.checkout import google_checkout
from speeqeweb.cart import cart
from speeqeweb.cart.models import CartItem
from speeqeweb.catalog.models import Venue
from speeqeweb.checkout.models import Order, OrderItem
from speeqeweb.checkout.forms import CheckoutForm, CheckoutFormCash
from speeqeweb.checkout import authnet
from speeqeweb import settings

from django.core import urlresolvers
import urllib

def get_checkout_url(request):
    """ returns the URL from the checkout module for cart """
    # use this for Google Checkout API:
    # return google_checkout.get_checkout_url(request)
    
    # use this for our own-site checkout
    return urlresolvers.reverse('checkout')
    
def process(request, venue_id):
    postdata = request.POST.copy()
    amount = cart.cart_subtotal(request, venue_id)
    results = {}
    prepare_order_cash(request, venue_id)
    results = {'order_number': 0, 'message': u''}
    return results


def prepare_order_cash(request, venue_id):
    #cart_items = CartItem()
    cart_items = cart.get_cart_items(request, venue_id)
    for ci in cart_items:
        ci.cart_status = '2'
        ci.save()
    return cart


def merchant_order_accepted(request, venue_id):
    postdata = request.POST.copy()
    amount = cart.cart_subtotal(request, venue_id)
    results = {}
    cartnumber = merchant_response_2(request, venue_id)
    results = {'order_number': 0, 'message': u''}
    return cartnumber


def merchant_order_finalized(request, venue_id):
    postdata = request.POST.copy()
    amount = cart.cart_subtotal(request, venue_id)
    results = {}
    cartnumber = merchant_response_3(request, venue_id)
    results = {'order_number': 0, 'message': u''}
    return cartnumber

def merchant_order_paid(request, venue_id):
    postdata = request.POST.copy()
    amount = cart.cart_subtotal(request, venue_id)
    results = {}
    ferror = create_order_cash(request, venue_id)
    results = {'order_number': 0, 'message': u''}
    return ferror


def merchant_response_2(request, venue_id):
    cart_items = cart.get_cart_items2(request, venue_id)
    if cart_items:
        cartnumber = 1
    else:
        cartnumber = 0
    for ci in cart_items:
        ci.merchant_response = '2'
        ci.save()
    return cartnumber


def merchant_response_3(request, venue_id):
    cart_items = cart.get_cart_items2(request, venue_id)
    if cart_items:
        cartnumber = 1
    else:
        cartnumber = 0
    for ci in cart_items:
        ci.merchant_response = '3'
        ci.save()
    return cartnumber


def create_order_cash(request, venue_id):
    order = Order()
    postdata = request.POST.copy()
    postdata.__setitem__('venue', venue_id)

    postdata.__setitem__('billing_name', request.session['billing_name'])
    postdata.__setitem__('email', request.session['email'])
    postdata.__setitem__('phone', request.session['phone'])

    checkout_form = CheckoutFormCash(postdata, instance=order)
    if checkout_form.is_valid():
        order = checkout_form.save(commit=False)
        
        order.billing_zip = '10000'
        order.transaction_id = '0'
        order.ip_address = request.META.get('REMOTE_ADDR')
        order.user = None
        if request.user.is_authenticated():
            order.user = request.user
        order.status = Order.SUBMITTED
        order.save()
        
        if order.pk:
            cart_items = cart.get_cart_items2_3(request, venue_id)
            for ci in cart_items:
                oi = OrderItem()
                oi.order = order
                oi.quantity = ci.quantity
                oi.price = ci.price  # now using @property
                oi.product = ci.product
                oi.save()
            # all set, clear the cart
            cart.empty_cart3(request, venue_id)
            """
            # save profile info for future orders
            if request.user.is_authenticated():
                from speeqeweb.accounts import profile
                profile.set(request)
            """
        
        ferror = 1
    else:
        ferror = checkout_form.errors.as_ul()

    return ferror