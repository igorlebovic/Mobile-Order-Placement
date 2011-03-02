from django.shortcuts import render_to_response, get_object_or_404
from speeqeweb.cart import cart
from django.template import RequestContext

from django.http import HttpResponseRedirect
from speeqeweb.checkout import checkout
from speeqeweb import settings

from speeqeweb.catalog.forms import ProductAddToCartForm
from django.core.cache import cache
from speeqeweb.catalog.models import Category, Product, ProductReview, Venue
from speeqeweb.catalog.forms import ProductAddToCartForm, ProductReviewForm
from speeqeweb.settings import CACHE_TIMEOUT
from speeqeweb.stats import stats
from django.utils import simplejson
from django.http import HttpResponseRedirect, HttpResponse


def show_cart(request, venue_id, template_name="cart/show_cart.html"):
    """ view for each product page """
    #create the bound form
    postdata = request.POST.copy()
    form = ProductAddToCartForm(request, postdata)
    #check if posted data is valid
    if postdata['submit'] == 'Remove':
        cart.remove_from_cart(request, venue_id)
    if postdata['submit'] == 'Update':
        cart.update_cart(request, venue_id)
    if postdata['submit'] == 'Add':
        if form.is_valid():
            #add to cart and redirect to cart page
            cart.add_to_cart(request, venue_id)
        else:
            ferrors=form.errors
    # if test cookie worked, get rid of it
    if request.session.test_cookie_worked():
        request.session.delete_test_cookie()
    cart_items = cart.get_cart_items(request, venue_id)
    page_title = 'Shopping Cart'
    cart_subtotal = cart.cart_subtotal(request, venue_id)
    return render_to_response(template_name, locals(), context_instance=RequestContext(request))

def modify_cart(request, product_slug, template_name="cart/modify_cart.html"):
    """ view for each product page """
    postdata = request.POST.copy()
    item_id = postdata['item_id']
    quantity = postdata['quantity']
    product_cache_key = request.path
    # try to get product from cache
    p = cache.get(product_cache_key)
    # if a cache miss, fall back on db query
    if not p:
        p = get_object_or_404(Product.active, slug=product_slug)
        # store item in cache for next time
        cache.set(product_cache_key, p, CACHE_TIMEOUT)
    categories = p.categories.filter(is_active=True)
    page_title = p.name
    meta_keywords = p.meta_keywords
    meta_description = p.meta_description
    venue_id = categories[0].venue.id
    # evaluate the HTTP method, change as needed
    #create the unbound form. Notice the request as a keyword argument
    form = ProductAddToCartForm(request=request, label_suffix=':')
    # assign the hidden input the product slug
    form.fields['product_slug'].widget.attrs['value'] = product_slug
    # set test cookie to make sure cookies are enabled
    request.session.set_test_cookie()
    stats.log_product_view(request, p)
    # product review additions, CH 10
    product_reviews = ProductReview.approved.filter(product=p).order_by('-date')
    review_form = ProductReviewForm()
    return render_to_response(template_name, locals(), context_instance=RequestContext(request))