from django.contrib import admin
from speeqeweb.catalog.models import Product, Category, ProductReview, Venue
from speeqeweb.catalog.forms import ProductAdminForm

class CategoryInline(admin.StackedInline):
    model = Category

class VenueAdmin(admin.ModelAdmin):
    #sets up values for how admin site lists categories
    list_display = ('name', 'address_1', 'zip', 'city', 'state', )
    list_display_links = ('name',)
    list_per_page = 20
    ordering = ['name']
    search_fields = ['name', 'address_1', 'zip', 'city', 'state', ]
    
    prepopulated_fields = {"slug": ("city", "name", )}
    
    inlines = [CategoryInline, ]
    
#    class Meta:
#        user = getattr(request, 'user', None)
#        if user.is_superuser:
#    def queryset(self, request):
#        user = getattr(request, 'user', None)
#        self.exclude = ('merchant', )
#        return super(CategoryAdmin, self).queryset(request).filter(merchant=user)
    
admin.site.register(Venue, VenueAdmin)
    
class ProductReviewInline(admin.TabularInline):
    model = ProductReview
    extra = 1

class ProductAdmin(admin.ModelAdmin):
    form = ProductAdminForm
    # sets values for how the admin site lists your products 
    list_display = ('name', 'price', 'old_price', 'created_at', 'updated_at',)
    # which of the fields in 'list_display' tuple link to admin product page
    list_display_links = ('name',)
    list_per_page = 50
    ordering = ['-created_at']
    search_fields = ['name', 'description', 'meta_keywords', 'meta_description']
    # exclude = ('created_at', 'updated_at',)
    # sets up slug to be generated from product name
    prepopulated_fields = {'slug' : ('name',)}
    
    inlines = [ProductReviewInline, ]
    
#    def queryset(self, request):
#        user = getattr(request, 'user', None)
#        return super(ProductAdmin, self).queryset(request).filter(user=user)
    
# registers your product model with the admin site
admin.site.register(Product, ProductAdmin)

class CategoryAdmin(admin.ModelAdmin):
    #sets up values for how admin site lists categories
    list_display = ('name', 'created_at', 'updated_at', 'venue_permalink',)
    list_display_links = ('name', )
    list_per_page = 20
    ordering = ['venue', 'name']
    search_fields = ['name', 'description', 'meta_keywords', 'meta_description', 'venue']
    # exclude = ('created_at', 'updated_at',)
    
    # sets up slug to be generated from category name
    prepopulated_fields = {'slug' : ('name',)}
    
#    def queryset(self, request):
#        user = getattr(request, 'user', None)
#        return super(CategoryAdmin, self).queryset(request).filter(merchant=user)
    
admin.site.register(Category, CategoryAdmin)

class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'title', 'date', 'rating', 'is_approved')
    list_per_page = 20
    list_filter = ('product', 'user', 'is_approved')
    ordering = ['date']
    search_fields = ['user','content','title']
    
admin.site.register(ProductReview, ProductReviewAdmin)
