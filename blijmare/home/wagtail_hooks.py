from wagtail import hooks
from django.urls import reverse, path
from wagtail.admin.menu import MenuItem
from django.utils.html import format_html

from wagtail.admin.ui.components import Component
from .views import admin_reservaties, admin_standplaatsen


class WelcomePanel(Component):
  order = 50

  def render_html(self, parent_context):
    return format_html(
      """
      <section class="panel summary nice-padding">
        <h3>No, but seriously -- welcome to the admin homepage.</h3>
      </section>
      """
    )

@hooks.register("register_icons")
def register_icons(icons):
    icons.append("home/bounding.svg")  # Add the new icon
    return icons

@hooks.register('construct_main_menu')
def hide_explorer_menu_item_from_frank(request, menu_items):
  items_to_hide = ['reports', 'documents', 'snippets', 'images']
  menu_items[:] = [item for item in menu_items if item.name not in items_to_hide]

@hooks.register('construct_homepage_panels')
def add_another_welcome_panel(request, panels):
    panels.append(WelcomePanel())

@hooks.register('register_admin_menu_item')
def register_frank_menu_item():
  return MenuItem('Standplaatsen', reverse("admin-standplaatsen"),
                  icon_name='home',
                  order=10000)

@hooks.register('register_admin_menu_item')
def register_frank_menu_item():
  return MenuItem('Reservaties', reverse("admin-reservaties"),
                  icon_name='calendar-alt',
                  order=10000)

@hooks.register('register_admin_urls')
def urlconf_time():
  return [
    path('reservaties/', admin_reservaties, name='admin-reservaties'),
    path('standplaatsen/', admin_standplaatsen, name='admin-standplaatsen'),
  ]