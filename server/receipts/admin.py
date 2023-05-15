from django.contrib import admin

from .models import Receipt, Tag, PasswordRecovery

from django.utils.translation import gettext_lazy as _
from django.contrib.admin import ListFilter
from .models import ExtendedUser

# Register your models here.


class TagListFilter(ListFilter):
    title = _('tags')
    parameter_name = 'tags'

    def lookups(self, request, model_admin):
        # Create a list of tuples with the tag names and their ids as the values
        tags = Tag.objects.all().values_list('id', 'tag_name')
        return tags

    def queryset(self, request, queryset):
        if self.value():
            # Filter the receipts by the selected tag id
            return queryset.filter(tags__id=self.value())

    def value(self):
        return self.used_parameters.get(self.parameter_name)

    def has_output(self):
        return bool(self.used_parameters.get(self.parameter_name))

class ReceiptAdmin(admin.ModelAdmin):
    list_display = ('user', 'store_name', 'date', 'tax', 'cost', 'tags_display')
    list_filter = ('user', 'store_name', 'date', 'cost', TagListFilter)

    def tags_display(self, obj):
        return ', '.join([tag.tag_name for tag in obj.tags.all()])


class TagAdmin(admin.ModelAdmin):
    list_display = ('tag_name',)
    list_filter = ('tag_name',)

class PasswordRecoveryAdmin(admin.ModelAdmin):
    list_display = ('token', 'expires_at', 'user')
    list_filter = ('expires_at', 'user')

admin.site.register(ExtendedUser)
admin.site.register(Receipt, ReceiptAdmin)
admin.site.register(Tag, TagAdmin)
admin.site.register(PasswordRecovery, PasswordRecoveryAdmin)
