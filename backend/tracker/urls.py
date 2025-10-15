from django.urls import path
from .views import (
    UserRegistrationView,
    UserLoginView,
    UserLogoutView,
    SatelliteListView,
    UserSatelliteSelectionView,
    SatellitePositionView
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('satellites/', SatelliteListView.as_view(), name='satellite-list'),
    path('selections/', UserSatelliteSelectionView.as_view(), name='user-selections'),
    path('selections/<int:pk>/', UserSatelliteSelectionView.as_view(), name='user-selection-delete'),
    path('positions/', SatellitePositionView.as_view(), name='satellite-positions'),
]