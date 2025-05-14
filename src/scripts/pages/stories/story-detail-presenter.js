import StoryAPI from '../../data/api';
import Swal from 'sweetalert2';
import 'ol/ol.css';
import { Map, View } from 'ol';
import { Tile as TileLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon } from 'ol/style';

class StoryDetailPresenter {
  #view = null;
  #map = null;
  #vectorSource = null;

  constructor(view) {
    this.#view = view;
  }

  async getStoryDetail(id) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }

      const response = await StoryAPI.getStoryById(id, token);
      if (response.error) {
        throw new Error(response.message);
      }

      return response.story;
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Failed to Load Story',
        text: error.message,
      });

      if (error.message === 'Token not found') {
        window.location.hash = '#/login';
      }
      throw error;
    }
  }

  initMap(container) {
    this.#vectorSource = new VectorSource();

    this.#map = new Map({
      target: container,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new VectorLayer({
          source: this.#vectorSource,
        }),
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
    });
  }

  setMapView(lat, lon) {
    if (this.#map) {
      const view = this.#map.getView();
      view.setCenter(fromLonLat([lon, lat]));
      view.setZoom(13);
    }
  }

  addMarker(lat, lon, popupContent) {
    if (this.#map && this.#vectorSource) {
      const marker = new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
      });

      marker.setStyle(
        new Style({
          image: new Icon({
            src: 'https://openlayers.org/en/latest/examples/data/icon.png', // Replace with your marker icon URL
            scale: 1,
          }),
        })
      );

      this.#vectorSource.addFeature(marker);
    }
  }

  destroyMap() {
    if (this.#map) {
      this.#map.setTarget(null);
      this.#map = null;
      this.#vectorSource = null;
    }
  }
}

export default StoryDetailPresenter;
