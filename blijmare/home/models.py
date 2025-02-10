from django.db import models
from django.urls import reverse

from wagtail.models import Page
from wagtail.fields import RichTextField

# import MultiFieldPanel:
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.contrib.forms.models import AbstractEmailForm, AbstractFormField

# import FormSubmissionsPanel:
from wagtail.contrib.forms.panels import FormSubmissionsPanel

class Inschrijven(Page):
    body = RichTextField(blank=True)

    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    # modify your content_panels:
    content_panels = Page.content_panels + [
        FieldPanel('body')
    ]

class HomePage(Page):
    # add the Hero section of HomePage:
    image = models.ForeignKey(
        "wagtailimages.Image",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        help_text="Homepage image",
    )

    hero_title = models.CharField(
        blank=True,
        max_length=255, help_text="Write an introduction for the site"
    )

    hero_subtitle = models.CharField(
        blank=True,
        max_length=255, help_text="Write an introduction for the site"
    )


    hero_cta = models.CharField(
        blank=True,
        verbose_name="Hero CTA",
        max_length=255,
        help_text="Text to display on Call to Action",
    )
    hero_cta_link = models.ForeignKey(
        "wagtailcore.Page",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        verbose_name="Hero CTA link",
        help_text="Choose a page to link to for the Call to Action",
    )

    body = RichTextField(blank=True)

    # modify your content_panels:
    content_panels = Page.content_panels + [
        MultiFieldPanel(
            [
                FieldPanel("image"),
                FieldPanel("hero_title"),
                FieldPanel("hero_subtitle"),
                FieldPanel("hero_cta"),
                FieldPanel("hero_cta_link"),
            ],
            heading="Hero section",
        ),
        FieldPanel('body'),
    ]


class Standplaats(models.Model):
    id = models.AutoField(primary_key=True)  # Explicit auto-incrementing primary key
    naam = models.CharField(max_length=255)
    geojson = models.TextField(help_text="GeoJSON data voor de polygoon van de standplaats")
    gebied = models.ForeignKey('gebied', on_delete=models.CASCADE, related_name='gebied', null=True)

    class Meta:
        verbose_name = "standplaats"
        verbose_name_plural = "standplaatsen"

    def __str__(self):
        return f"{self.naam} | {str(self.gebied)}"

    def save(self, *args, **kwargs):
        # Als de naam leeg is en er nog geen ID is (we zijn aan het creëren), stel de naam in op de ID.
        if not self.naam and not self.pk:
            # We slaan eerst het object op om de ID toe te wijzen
            super().save(*args, **kwargs)
            self.naam = str(self.pk)  # Zet de naam gelijk aan de ID (pk)
        super().save()  # Sla opnieuw op met de naam ingesteld

    def to_dict(self, reservering_id=None):
        data = {
            'id': self.id,
            'naam': self.naam,
            'geojson': self.geojson,
        }

        if reservering_id is not None:
            data['delete_from_reservering_url'] = reverse('verwijder_standplaats_uit_reservering', kwargs={
                'reservering_id': reservering_id,
                'standplaats_id': self.id
            })

        return data


class Reservering(models.Model):
    id = models.AutoField(primary_key=True)
    voornaam = models.CharField(max_length=100)
    familienaam = models.CharField(max_length=100)
    datum = models.DateField(auto_now_add=True)
    standplaatsen = models.ManyToManyField(Standplaats, related_name='reservaties')

    def __str__(self):
        return f"Reservatie {self.klantnaam} op {self.datum}"

    def to_dict(self):
        standplaatsen = self.standplaatsen.all()

        return {
            'id': self.id,
            'voornaam': self.voornaam,
            'familinaam': self.familienaam,
            'datum': self.datum,
            'delete_url': reverse('verwijder-reservering', kwargs={'reservering_id': self.id}),
            'standplaatsen': [ standplaats.to_dict(self.id) for standplaats in standplaatsen],
            'full_name': f"{self.voornaam} {self.familienaam}"
        }


class Gebied(models.Model):
    naam = models.CharField(max_length=255)
    id = models.AutoField(primary_key=True)  # Explicit auto-incrementing primary key

    class Meta:
        verbose_name = "gebied"
        verbose_name_plural = "gebieden"


from django.db import models

# import parentalKey:
from modelcluster.fields import ParentalKey

# import FieldRowPanel and InlinePanel:
from wagtail.admin.panels import (
    FieldPanel,
    FieldRowPanel,
    InlinePanel,
    MultiFieldPanel,
    PublishingPanel,
)

from wagtail.fields import RichTextField
from wagtail.models import (
    DraftStateMixin,
    PreviewableMixin,
    RevisionMixin,
    TranslatableMixin,
)





# ... keep the definition of NavigationSettings and FooterText. Add FormField and FormPage:
class FormField(AbstractFormField):
    page = ParentalKey('FormPage', on_delete=models.CASCADE, related_name='form_fields')


class FormPage(AbstractEmailForm):
    intro = RichTextField(blank=True)
    thank_you_text = RichTextField(blank=True)

    content_panels = AbstractEmailForm.content_panels + [
        FormSubmissionsPanel(),
        FieldPanel('intro'),
        InlinePanel('form_fields', label="Form fields"),
        FieldPanel('thank_you_text'),
        MultiFieldPanel([
            FieldRowPanel([
                FieldPanel('from_address'),
                FieldPanel('to_address'),
            ]),
            FieldPanel('subject'),
        ], "Email"),
    ]

