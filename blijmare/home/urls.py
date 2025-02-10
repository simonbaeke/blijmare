from django.urls import path

from .views import PolygonAPIView, MaakReserveringAPIView, VerwijderStandplaatsUitReserveringView

urlpatterns = [
     path('api/polygons/', PolygonAPIView.as_view(), name='polygon-list'),
     path('api/polygons/<int:pk>/', PolygonAPIView.as_view(), name='polygon-detail'),
     path('api/reserveringen/', MaakReserveringAPIView.as_view(), name='maak_reservering'),
     path('reserveringen/<int:reservering_id>/', MaakReserveringAPIView.as_view(), name='verwijder-reservering'),
     path(
          'api/reserveringen/<int:reservering_id>/standplaatsen/<int:standplaats_id>/',
          VerwijderStandplaatsUitReserveringView.as_view(),
          name='verwijder_standplaats_uit_reservering'
     ),

]