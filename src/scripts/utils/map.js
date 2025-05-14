import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat, toLonLat } from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Icon, Style } from 'ol/style';
import { defaults as defaultControls } from 'ol/control';
import Overlay from 'ol/Overlay';

class MapHelper {
  static #iconStyle = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: 'https://openlayers.org/en/latest/examples/data/icon.png', // ikon OpenLayers
      scale: 1,
    }),
  });

  static initMap(container, isInteractive = false) {
    const markerSource = new VectorSource();
    const markerLayer = new VectorLayer({
      source: markerSource,
    });

    const containerElement =
      typeof container === 'string' ? document.getElementById(container) : container;
    if (!containerElement) {
      console.error(`Container element "${container}" not found in the DOM!`);
      return;
    }

    const map = new Map({
      target: containerElement,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        markerLayer,
      ],
      view: new View({
        center: fromLonLat([118.014863, -2.548926]), // Indonesia center
        zoom: 5,
      }),
      controls: defaultControls({
        zoom: true,
        attribution: true,
      }),
    });

    // Ensure the popup element exists and is in the DOM
    let popupElement = document.getElementById('popup');
    if (!popupElement) {
      console.warn('Popup element not found in the DOM! Creating one dynamically.');
      popupElement = document.createElement('div');
      popupElement.id = 'popup';
      popupElement.className = 'ol-popup';
      popupElement.innerHTML = '<div id="popup-content"></div>';
      document.body.appendChild(popupElement);
    }

    // Adding overlay for popup
    const overlay = new Overlay({
      element: popupElement,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });
    map.addOverlay(overlay);

    if (isInteractive) {
      map.on('click', function (event) {
        markerSource.clear();

        const coordinate = event.coordinate;
        const lonLat = toLonLat(coordinate);

        const marker = new Feature({
          geometry: new Point(coordinate),
        });
        marker.setStyle(MapHelper.#iconStyle);
        markerSource.addFeature(marker);

        // Hide popup initially
        overlay.setPosition(undefined);

        // Dispatching custom event if needed
        const customEvent = new CustomEvent('locationselected', {
          detail: {
            lat: lonLat[1],
            lng: lonLat[0],
          },
        });

        const containerElement = document.getElementById(container) || container;
        if (containerElement) {
          containerElement.dispatchEvent(customEvent);
        } else {
          console.error('Container element not found for dispatching event.');
        }
      });

      markerLayer.getSource().on('addfeature', function (event) {
        const feature = event.feature;
        feature.on('click', function () {
          const coordinate = feature.getGeometry().getCoordinates();
          const lonLat = toLonLat(coordinate);

          overlay.setPosition(coordinate);

          const content = document.getElementById('popup-content');
          if (content) {
            content.innerHTML =
              'You clicked here: ' + lonLat[1].toFixed(6) + ', ' + lonLat[0].toFixed(6);
          } else {
            console.error('Popup content element not found!');
          }
        });
      });
    }

    return map;
  }

  static addMarker(mapInstance, lat, lon, popupContent) {
    const markerSource = mapInstance.getLayers().item(1).getSource();
    const marker = new Feature({
      geometry: new Point(fromLonLat([lon, lat])),
    });
    marker.set('popupContent', popupContent); // Bind the popup content to the marker
    marker.setStyle(MapHelper.#iconStyle);

    markerSource.addFeature(marker);

    mapInstance.on('singleclick', function (event) {
      let clickedOnMarker = false;

      mapInstance.forEachFeatureAtPixel(event.pixel, function (feature) {
        clickedOnMarker = true;
        const geometry = feature.getGeometry();
        const coordinates = geometry.getCoordinates();
        const overlay = mapInstance.getOverlays().item(0);
        if (overlay) {
          overlay.setPosition(coordinates);
          const content = document.getElementById('popup-content');
          if (content) {
            const featurePopupContent = feature.get('popupContent'); // Retrieve the popup content from the feature
            content.innerHTML = featurePopupContent || 'No content available';
          }
        }
      });

      // Hide popup if clicked outside any marker
      if (!clickedOnMarker) {
        const overlay = mapInstance.getOverlays().item(0);
        if (overlay) {
          overlay.setPosition(undefined);
        }
      }
    });

    // Add close button to the popup
    const popupElement = document.getElementById('popup');
    if (popupElement) {
      let closeButton = popupElement.querySelector('.popup-close-button');
      if (!closeButton) {
        closeButton = document.createElement('button');
        closeButton.className = 'popup-close-button';
        closeButton.innerHTML = '&times;'; // Use "×" symbol for close button
        closeButton.style.position = 'absolute';
        closeButton.style.top = '5px';
        closeButton.style.right = '5px';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.fontSize = '20px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.color = '#333';
        popupElement.appendChild(closeButton);
      }

      closeButton.addEventListener('click', function () {
        const overlay = mapInstance.getOverlays().item(0);
        if (overlay) {
          overlay.setPosition(undefined);
        }
      });
    }

    return marker;
  }
}

export default MapHelper;
