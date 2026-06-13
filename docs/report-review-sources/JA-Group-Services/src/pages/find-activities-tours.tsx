import { useState, useMemo } from 'react';
import { ArrowLeft, MapPin, Search, X, Globe2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/translations';

interface Destination {
  country: string;
  city: string;
  borough?: string;
  locationId: number;
  searchQuery?: string;
  flag: string;
}

const DESTINATIONS: Destination[] = [
  // United Kingdom - London Boroughs
  { country: "United Kingdom", city: "London", borough: "Westminster", locationId: 57, searchQuery: "Westminster, Big Ben, Parliament, Buckingham Palace", flag: "🇬🇧" },
  { country: "United Kingdom", city: "London", borough: "Camden", locationId: 57, searchQuery: "Camden Market, Camden Town", flag: "🇬🇧" },
  { country: "United Kingdom", city: "London", borough: "Tower Hamlets", locationId: 57, searchQuery: "Tower of London, Canary Wharf", flag: "🇬🇧" },
  { country: "United Kingdom", city: "London", borough: "Southwark", locationId: 57, searchQuery: "Borough Market, Tate Modern, Shakespeare Globe", flag: "🇬🇧" },
  { country: "United Kingdom", city: "London", borough: "Kensington and Chelsea", locationId: 57, searchQuery: "Kensington Palace, Natural History Museum", flag: "🇬🇧" },
  { country: "United Kingdom", city: "London", borough: "Greenwich", locationId: 57, searchQuery: "Greenwich Observatory, Maritime Museum", flag: "🇬🇧" },
  { country: "United Kingdom", city: "London", borough: "Hackney", locationId: 57, searchQuery: "Hackney, Shoreditch", flag: "🇬🇧" },
  { country: "United Kingdom", city: "London", borough: "Islington", locationId: 57, searchQuery: "Islington, Angel", flag: "🇬🇧" },
  { country: "United Kingdom", city: "London", borough: "Lambeth", locationId: 57, searchQuery: "South Bank, Waterloo", flag: "🇬🇧" },
  { country: "United Kingdom", city: "London", borough: "Wandsworth", locationId: 57, searchQuery: "Battersea, Clapham", flag: "🇬🇧" },
  { country: "United Kingdom", city: "London", borough: "City of London", locationId: 57, searchQuery: "Financial District, St Paul's Cathedral", flag: "🇬🇧" },
  // United Kingdom - Edinburgh Districts
  { country: "United Kingdom", city: "Edinburgh", borough: "Old Town", locationId: 618, searchQuery: "Edinburgh Castle, Royal Mile, Grassmarket", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Edinburgh", borough: "New Town", locationId: 618, searchQuery: "Princes Street, George Street, Charlotte Square", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Edinburgh", borough: "Leith", locationId: 618, searchQuery: "Royal Yacht Britannia, Shore, Ocean Terminal", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Edinburgh", borough: "Stockbridge", locationId: 618, searchQuery: "Royal Botanic Garden, Dean Village", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Edinburgh", borough: "Holyrood", locationId: 618, searchQuery: "Palace of Holyroodhouse, Arthur's Seat, Scottish Parliament", flag: "🇬🇧" },
  // United Kingdom - Manchester Districts
  { country: "United Kingdom", city: "Manchester", borough: "City Centre", locationId: 334, searchQuery: "Manchester Cathedral, Town Hall, Arndale Centre", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Manchester", borough: "Northern Quarter", locationId: 334, searchQuery: "Street Art, Independent Shops, Music Venues", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Manchester", borough: "Salford Quays", locationId: 334, searchQuery: "MediaCityUK, Lowry Theatre, Imperial War Museum", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Manchester", borough: "Castlefield", locationId: 334, searchQuery: "Roman Fort, Canals, Science and Industry Museum", flag: "🇬🇧" },
  // United Kingdom - Birmingham Districts
  { country: "United Kingdom", city: "Birmingham", borough: "City Centre", locationId: 335, searchQuery: "Bullring, Birmingham Museum, Victoria Square", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Birmingham", borough: "Jewellery Quarter", locationId: 335, searchQuery: "Museum of the Jewellery Quarter, St Paul's Square", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Birmingham", borough: "Digbeth", locationId: 335, searchQuery: "Street Art, Custard Factory, Independent Venues", flag: "🇬🇧" },
  // United Kingdom - Glasgow Districts
  { country: "United Kingdom", city: "Glasgow", borough: "City Centre", locationId: 618, searchQuery: "George Square, Glasgow Cathedral, Buchanan Street", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Glasgow", borough: "West End", locationId: 618, searchQuery: "Kelvingrove Museum, University, Botanic Gardens", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Glasgow", borough: "Merchant City", locationId: 618, searchQuery: "Gallery of Modern Art, Trongate, Ingram Street", flag: "🇬🇧" },
  // United Kingdom - Liverpool Districts
  { country: "United Kingdom", city: "Liverpool", borough: "City Centre", locationId: 340, searchQuery: "Liverpool ONE, Lime Street, St George's Hall", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Liverpool", borough: "Albert Dock", locationId: 340, searchQuery: "Tate Liverpool, Beatles Story, Maritime Museum", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Liverpool", borough: "Cavern Quarter", locationId: 340, searchQuery: "Cavern Club, Mathew Street, Beatles Sites", flag: "🇬🇧" },
  // United Kingdom - Bristol Districts
  { country: "United Kingdom", city: "Bristol", borough: "Harbourside", locationId: 336, searchQuery: "SS Great Britain, M Shed, Harbourside Walk", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Bristol", borough: "Clifton", locationId: 336, searchQuery: "Clifton Suspension Bridge, Observatory, Village", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Bristol", borough: "City Centre", locationId: 336, searchQuery: "Cabot Circus, Bristol Cathedral, Park Street", flag: "🇬🇧" },
  // United Kingdom - Oxford Districts
  { country: "United Kingdom", city: "Oxford", borough: "City Centre", locationId: 337, searchQuery: "Bodleian Library, Radcliffe Camera, Carfax Tower", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Oxford", borough: "University Colleges", locationId: 337, searchQuery: "Christ Church, Magdalen College, All Souls", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Oxford", borough: "Jericho", locationId: 337, searchQuery: "Oxford Canal, Phoenix Picturehouse, Walton Street", flag: "🇬🇧" },
  // United Kingdom - Cambridge Districts
  { country: "United Kingdom", city: "Cambridge", borough: "City Centre", locationId: 338, searchQuery: "King's College Chapel, Market Square, Great St Mary's", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Cambridge", borough: "The Backs", locationId: 338, searchQuery: "River Cam, Punting, College Gardens", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Cambridge", borough: "University Colleges", locationId: 338, searchQuery: "Trinity College, St John's College, Queens' College", flag: "🇬🇧" },
  // United Kingdom - Bath Districts
  { country: "United Kingdom", city: "Bath", borough: "City Centre", locationId: 339, searchQuery: "Roman Baths, Bath Abbey, Pump Room", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Bath", borough: "Royal Crescent", locationId: 339, searchQuery: "Royal Crescent, Circus, Georgian Architecture", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Bath", borough: "Pulteney Bridge Area", locationId: 339, searchQuery: "Pulteney Bridge, Parade Gardens, River Avon", flag: "🇬🇧" },
  // United Kingdom - York Districts
  { country: "United Kingdom", city: "York", borough: "City Centre", locationId: 341, searchQuery: "York Minster, Shambles, Clifford's Tower", flag: "🇬🇧" },
  { country: "United Kingdom", city: "York", borough: "City Walls", locationId: 341, searchQuery: "Medieval Walls, Bootham Bar, Micklegate Bar", flag: "🇬🇧" },
  { country: "United Kingdom", city: "York", borough: "Jorvik", locationId: 341, searchQuery: "Jorvik Viking Centre, Coppergate, Archaeological Sites", flag: "🇬🇧" },
  // United Kingdom - Brighton Districts
  { country: "United Kingdom", city: "Brighton", borough: "Brighton Pier Area", locationId: 353, searchQuery: "Brighton Pier, Beach, Seafront", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Brighton", borough: "The Lanes", locationId: 353, searchQuery: "North Laine, South Lanes, Independent Shops", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Brighton", borough: "Hove", locationId: 353, searchQuery: "Hove Lawns, British Airways i360, Seafront", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Canterbury", locationId: 355, flag: "🇬🇧" },
  { country: "United Kingdom", city: "Windsor", locationId: 356, flag: "🇬🇧" },
  { country: "United Kingdom", city: "Exeter", locationId: 357, flag: "🇬🇧" },
  { country: "United Kingdom", city: "Plymouth", locationId: 358, flag: "🇬🇧" },
  { country: "United Kingdom", city: "Bournemouth", locationId: 359, flag: "🇬🇧" },
  { country: "United Kingdom", city: "Cornwall", locationId: 360, flag: "🇬🇧" },
  { country: "United Kingdom", city: "Nottingham", locationId: 361, flag: "🇬🇧" },
  { country: "United Kingdom", city: "Leicester", locationId: 362, flag: "🇬🇧" },
  { country: "United Kingdom", city: "Coventry", locationId: 363, flag: "🇬🇧" },
  { country: "United Kingdom", city: "Stratford-upon-Avon", locationId: 364, flag: "🇬🇧" },
  { country: "United Kingdom", city: "Newcastle", locationId: 365, flag: "🇬🇧" },
  { country: "United Kingdom", city: "Leeds", locationId: 366, flag: "🇬🇧" },
  { country: "United Kingdom", city: "Sheffield", locationId: 369, flag: "🇬🇧" },
  { country: "United Kingdom", city: "Reading", locationId: 371, flag: "🇬🇧" },
  // United Kingdom - Cardiff Districts
  { country: "United Kingdom", city: "Cardiff", borough: "City Centre", locationId: 452, searchQuery: "Cardiff Castle, Principality Stadium, St David's Centre", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Cardiff", borough: "Cardiff Bay", locationId: 452, searchQuery: "Wales Millennium Centre, Senedd, Mermaid Quay", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Cardiff", borough: "Cathays Park", locationId: 452, searchQuery: "National Museum, City Hall, Civic Centre", flag: "🇬🇧" },
  // United Kingdom - Belfast Districts
  { country: "United Kingdom", city: "Belfast", borough: "City Centre", locationId: 32386, searchQuery: "City Hall, Victoria Square, Cathedral Quarter", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Belfast", borough: "Titanic Quarter", locationId: 32386, searchQuery: "Titanic Belfast, SS Nomadic, Titanic Studios", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Belfast", borough: "Queen's Quarter", locationId: 32386, searchQuery: "Queen's University, Botanic Gardens, Ulster Museum", flag: "🇬🇧" },
  { country: "United Kingdom", city: "Aberdeen", locationId: 443, flag: "🇬🇧" },
  { country: "United Kingdom", city: "Inverness", locationId: 445, flag: "🇬🇧" },
  { country: "United Kingdom", city: "Isle of Skye", locationId: 449, flag: "🇬🇧" },
  { country: "United Kingdom", city: "Lake District", locationId: 342, flag: "🇬🇧" },
  { country: "United Kingdom", city: "Stonehenge", locationId: 398, flag: "🇬🇧" },
  { country: "United Kingdom", city: "Isle of Wight", locationId: 396, flag: "🇬🇧" },
  { country: "United Kingdom", city: "Jersey", locationId: 466, flag: "🇯🇪" },
  { country: "United Kingdom", city: "Guernsey", locationId: 467, flag: "🇬🇬" },

  // Portugal - Lisbon Districts
  { country: "Portugal", city: "Lisbon", borough: "Baixa", locationId: 42, searchQuery: "Rossio Square, Rua Augusta, Commerce Square", flag: "🇵🇹" },
  { country: "Portugal", city: "Lisbon", borough: "Alfama", locationId: 42, searchQuery: "São Jorge Castle, Fado, Narrow Streets", flag: "🇵🇹" },
  { country: "Portugal", city: "Lisbon", borough: "Belém", locationId: 42, searchQuery: "Jerónimos Monastery, Belém Tower, Pasteis de Belém", flag: "🇵🇹" },
  { country: "Portugal", city: "Lisbon", borough: "Bairro Alto", locationId: 42, searchQuery: "Nightlife, Miradouro, Chiado", flag: "🇵🇹" },
  { country: "Portugal", city: "Lisbon", borough: "Parque das Nações", locationId: 42, searchQuery: "Oceanarium, Cable Car, Modern Architecture", flag: "🇵🇹" },
  
  // Portugal - Porto Districts
  { country: "Portugal", city: "Porto", borough: "Ribeira", locationId: 43, searchQuery: "Douro River, Ribeira Square, Colorful Houses", flag: "🇵🇹" },
  { country: "Portugal", city: "Porto", borough: "Vila Nova de Gaia", locationId: 43, searchQuery: "Port Wine Cellars, Dom Luís Bridge View", flag: "🇵🇹" },
  { country: "Portugal", city: "Porto", borough: "Baixa", locationId: 43, searchQuery: "Clerigos Tower, Lello Bookstore, São Bento Station", flag: "🇵🇹" },
  { country: "Portugal", city: "Porto", borough: "Foz do Douro", locationId: 43, searchQuery: "Beach, Atlantic Ocean, Lighthouse", flag: "🇵🇹" },
  
  // Portugal - Mainland Cities
  { country: "Portugal", city: "Sintra", locationId: 408, flag: "🇵🇹" },
  { country: "Portugal", city: "Cascais", locationId: 408, flag: "🇵🇹" },
  { country: "Portugal", city: "Estoril", locationId: 408, flag: "🇵🇹" },
  { country: "Portugal", city: "Coimbra", locationId: 409, flag: "🇵🇹" },
  { country: "Portugal", city: "Braga", locationId: 410, flag: "🇵🇹" },
  { country: "Portugal", city: "Guimarães", locationId: 410, flag: "🇵🇹" },
  { country: "Portugal", city: "Évora", locationId: 409, flag: "🇵🇹" },
  { country: "Portugal", city: "Aveiro", locationId: 43, flag: "🇵🇹" },
  { country: "Portugal", city: "Viseu", locationId: 409, flag: "🇵🇹" },
  { country: "Portugal", city: "Setúbal", locationId: 42, flag: "🇵🇹" },
  { country: "Portugal", city: "Bragança", locationId: 410, flag: "🇵🇹" },
  { country: "Portugal", city: "Viana do Castelo", locationId: 410, flag: "🇵🇹" },
  { country: "Portugal", city: "Guarda", locationId: 409, flag: "🇵🇹" },
  { country: "Portugal", city: "Leiria", locationId: 409, flag: "🇵🇹" },
  { country: "Portugal", city: "Santarém", locationId: 42, flag: "🇵🇹" },
  { country: "Portugal", city: "Portalegre", locationId: 409, flag: "🇵🇹" },
  { country: "Portugal", city: "Castelo Branco", locationId: 409, flag: "🇵🇹" },
  { country: "Portugal", city: "Beja", locationId: 409, flag: "🇵🇹" },
  { country: "Portugal", city: "Figueira da Foz", locationId: 409, flag: "🇵🇹" },
  { country: "Portugal", city: "Tomar", locationId: 409, flag: "🇵🇹" },
  { country: "Portugal", city: "Batalha", locationId: 409, flag: "🇵🇹" },
  { country: "Portugal", city: "Alcobaça", locationId: 409, flag: "🇵🇹" },
  { country: "Portugal", city: "Nazaré", locationId: 409, flag: "🇵🇹" },
  { country: "Portugal", city: "Óbidos", locationId: 409, flag: "🇵🇹" },
  { country: "Portugal", city: "Peniche", locationId: 409, flag: "🇵🇹" },
  { country: "Portugal", city: "Mafra", locationId: 42, flag: "🇵🇹" },
  { country: "Portugal", city: "Torres Vedras", locationId: 42, flag: "🇵🇹" },
  
  // Portugal - Algarve Region
  { country: "Portugal", city: "Algarve", borough: "Faro", locationId: 1207, searchQuery: "Faro Old Town, Ria Formosa, Cathedral", flag: "🇵🇹" },
  { country: "Portugal", city: "Algarve", borough: "Albufeira", locationId: 404, searchQuery: "Albufeira Beach, Old Town, Nightlife", flag: "🇵🇹" },
  { country: "Portugal", city: "Algarve", borough: "Lagos", locationId: 405, searchQuery: "Ponta da Piedade, Beaches, Historic Center", flag: "🇵🇹" },
  { country: "Portugal", city: "Algarve", borough: "Portimão", locationId: 404, searchQuery: "Praia da Rocha, Marina, Beach", flag: "🇵🇹" },
  { country: "Portugal", city: "Algarve", borough: "Vilamoura", locationId: 404, searchQuery: "Marina, Golf, Beaches", flag: "🇵🇹" },
  { country: "Portugal", city: "Algarve", borough: "Tavira", locationId: 1207, searchQuery: "Historic Town, Roman Bridge, Island Beaches", flag: "🇵🇹" },
  { country: "Portugal", city: "Algarve", borough: "Sagres", locationId: 405, searchQuery: "Cape St Vincent, Lighthouse, Dramatic Cliffs", flag: "🇵🇹" },
  { country: "Portugal", city: "Algarve", borough: "Carvoeiro", locationId: 404, searchQuery: "Beach, Boardwalk, Algar Seco", flag: "🇵🇹" },
  { country: "Portugal", city: "Algarve", borough: "Quinta do Lago", locationId: 1207, searchQuery: "Luxury Resort, Golf, Nature Reserve", flag: "🇵🇹" },
  { country: "Portugal", city: "Algarve", borough: "Olhão", locationId: 1207, searchQuery: "Fish Market, Ria Formosa, Island Ferries", flag: "🇵🇹" },
  
  // Portugal - Madeira Archipelago
  { country: "Portugal", city: "Madeira", borough: "Funchal", locationId: 1208, searchQuery: "Funchal, Monte Palace, Cable Car", flag: "🇵🇹" },
  { country: "Portugal", city: "Madeira", borough: "Canical", locationId: 1208, searchQuery: "Canical, Whale Museum, Ponta de São Lourenço", flag: "🇵🇹" },
  { country: "Portugal", city: "Madeira", borough: "Porto Moniz", locationId: 1208, searchQuery: "Porto Moniz, Natural Pools, Volcanic Pools", flag: "🇵🇹" },
  { country: "Portugal", city: "Madeira", borough: "Machico", locationId: 1208, searchQuery: "Machico, Beach, Historic Town", flag: "🇵🇹" },
  { country: "Portugal", city: "Madeira", borough: "Santana", locationId: 1208, searchQuery: "Santana, Traditional Houses, Levada Walks", flag: "🇵🇹" },
  { country: "Portugal", city: "Madeira", borough: "Câmara de Lobos", locationId: 1208, searchQuery: "Câmara de Lobos, Fishing Village, Cabo Girão", flag: "🇵🇹" },
  { country: "Portugal", city: "Madeira", borough: "Calheta", locationId: 1208, searchQuery: "Calheta, Beach, Marina", flag: "🇵🇹" },
  { country: "Portugal", city: "Madeira", borough: "Ribeira Brava", locationId: 1208, searchQuery: "Ribeira Brava, Town Center", flag: "🇵🇹" },
  { country: "Portugal", city: "Madeira", borough: "Porto Santo", locationId: 1208, searchQuery: "Porto Santo Island, Golden Beach", flag: "🇵🇹" },
  
  // Portugal - Azores Archipelago
  { country: "Portugal", city: "Azores", borough: "Ponta Delgada (São Miguel)", locationId: 32387, searchQuery: "Ponta Delgada, Sete Cidades, Furnas", flag: "🇵🇹" },
  { country: "Portugal", city: "Azores", borough: "Angra do Heroísmo (Terceira)", locationId: 32387, searchQuery: "Angra do Heroísmo, UNESCO World Heritage", flag: "🇵🇹" },
  { country: "Portugal", city: "Azores", borough: "Horta (Faial)", locationId: 32387, searchQuery: "Horta, Marina, Pico Mountain View", flag: "🇵🇹" },
  { country: "Portugal", city: "Azores", borough: "Pico Island", locationId: 32387, searchQuery: "Pico Mountain, Wine Region, Whale Watching", flag: "🇵🇹" },
  { country: "Portugal", city: "Azores", borough: "São Jorge Island", locationId: 32387, searchQuery: "São Jorge, Fajãs, Cheese Production", flag: "🇵🇹" },
  { country: "Portugal", city: "Azores", borough: "Flores Island", locationId: 32387, searchQuery: "Flores, Waterfalls, Remote Nature", flag: "🇵🇹" },
  { country: "Portugal", city: "Azores", borough: "Graciosa Island", locationId: 32387, searchQuery: "Graciosa, Furna do Enxofre, Windmills", flag: "🇵🇹" },
  { country: "Portugal", city: "Azores", borough: "Santa Maria Island", locationId: 32387, searchQuery: "Santa Maria, Beaches, Vineyards", flag: "🇵🇹" },

  // Spain
  // Spain - Barcelona Districts
  { country: "Spain", city: "Barcelona", borough: "Gothic Quarter (Barri Gòtic)", locationId: 39, searchQuery: "Gothic Quarter, Barcelona Cathedral", flag: "🇪🇸" },
  { country: "Spain", city: "Barcelona", borough: "Eixample", locationId: 39, searchQuery: "Sagrada Familia, Casa Batlló, Passeig de Gràcia", flag: "🇪🇸" },
  { country: "Spain", city: "Barcelona", borough: "Gràcia", locationId: 39, searchQuery: "Park Güell, Gràcia neighborhood", flag: "🇪🇸" },
  { country: "Spain", city: "Barcelona", borough: "Barceloneta", locationId: 39, searchQuery: "Beach, Port Vell, Seafront", flag: "🇪🇸" },
  { country: "Spain", city: "Barcelona", borough: "Montjuïc", locationId: 39, searchQuery: "Montjuïc Castle, Magic Fountain, Olympic Stadium", flag: "🇪🇸" },
  // Spain - Madrid Districts
  { country: "Spain", city: "Madrid", borough: "Centro", locationId: 40, searchQuery: "Puerta del Sol, Plaza Mayor, Royal Palace", flag: "🇪🇸" },
  { country: "Spain", city: "Madrid", borough: "Retiro", locationId: 40, searchQuery: "Retiro Park, Prado Museum, Crystal Palace", flag: "🇪🇸" },
  { country: "Spain", city: "Madrid", borough: "Salamanca", locationId: 40, searchQuery: "Shopping, Serrano Street, Upscale District", flag: "🇪🇸" },
  { country: "Spain", city: "Madrid", borough: "Chueca", locationId: 40, searchQuery: "Nightlife, Plaza de Chueca, Trendy Bars", flag: "🇪🇸" },
  // Spain - Seville Districts
  { country: "Spain", city: "Seville", borough: "Santa Cruz", locationId: 41, searchQuery: "Cathedral, Giralda, Alcazar", flag: "🇪🇸" },
  { country: "Spain", city: "Seville", borough: "Triana", locationId: 41, searchQuery: "Triana Bridge, Flamenco, Ceramics", flag: "🇪🇸" },
  { country: "Spain", city: "Seville", borough: "Arenal", locationId: 41, searchQuery: "Bullring, Torre del Oro, River", flag: "🇪🇸" },
  { country: "Spain", city: "Valencia", locationId: 435, flag: "🇪🇸" },
  { country: "Spain", city: "Granada", locationId: 436, flag: "🇪🇸" },
  { country: "Spain", city: "Malaga", locationId: 437, flag: "🇪🇸" },
  { country: "Spain", city: "Bilbao", locationId: 438, flag: "🇪🇸" },
  { country: "Spain", city: "Toledo", locationId: 40, flag: "🇪🇸" },
  { country: "Spain", city: "Cordoba", locationId: 41, flag: "🇪🇸" },
  { country: "Spain", city: "San Sebastian", locationId: 438, flag: "🇪🇸" },
  { country: "Spain", city: "Ibiza", locationId: 439, flag: "🇪🇸" },
  { country: "Spain", city: "Mallorca", locationId: 440, flag: "🇪🇸" },
  { country: "Spain", city: "Tenerife", locationId: 441, flag: "🇪🇸" },
  { country: "Spain", city: "Gran Canaria", locationId: 441, flag: "🇪🇸" },

  // France
  // France - Paris Arrondissements
  { country: "France", city: "Paris", borough: "1st Arrondissement (Louvre)", locationId: 37, searchQuery: "Louvre Museum, Tuileries Garden", flag: "🇫🇷" },
  { country: "France", city: "Paris", borough: "4th Arrondissement (Marais)", locationId: 37, searchQuery: "Notre-Dame, Place des Vosges, Le Marais", flag: "🇫🇷" },
  { country: "France", city: "Paris", borough: "5th Arrondissement (Latin Quarter)", locationId: 37, searchQuery: "Pantheon, Sorbonne, Latin Quarter", flag: "🇫🇷" },
  { country: "France", city: "Paris", borough: "6th Arrondissement (Saint-Germain)", locationId: 37, searchQuery: "Luxembourg Gardens, Saint-Germain-des-Prés", flag: "🇫🇷" },
  { country: "France", city: "Paris", borough: "7th Arrondissement (Eiffel Tower)", locationId: 37, searchQuery: "Eiffel Tower, Invalides, Musée d'Orsay", flag: "🇫🇷" },
  { country: "France", city: "Paris", borough: "8th Arrondissement (Champs-Élysées)", locationId: 37, searchQuery: "Champs-Élysées, Arc de Triomphe", flag: "🇫🇷" },
  { country: "France", city: "Paris", borough: "9th Arrondissement (Opera)", locationId: 37, searchQuery: "Palais Garnier, Galeries Lafayette", flag: "🇫🇷" },
  { country: "France", city: "Paris", borough: "11th Arrondissement (Bastille)", locationId: 37, searchQuery: "Place de la Bastille, Oberkampf", flag: "🇫🇷" },
  { country: "France", city: "Paris", borough: "16th Arrondissement (Trocadéro)", locationId: 37, searchQuery: "Trocadéro, Bois de Boulogne", flag: "🇫🇷" },
  { country: "France", city: "Paris", borough: "18th Arrondissement (Montmartre)", locationId: 37, searchQuery: "Sacré-Cœur, Montmartre, Moulin Rouge", flag: "🇫🇷" },
  { country: "France", city: "Nice", locationId: 471, flag: "🇫🇷" },
  { country: "France", city: "Lyon", locationId: 472, flag: "🇫🇷" },
  { country: "France", city: "Marseille", locationId: 473, flag: "🇫🇷" },
  { country: "France", city: "Bordeaux", locationId: 474, flag: "🇫🇷" },
  { country: "France", city: "Cannes", locationId: 475, flag: "🇫🇷" },
  { country: "France", city: "Monaco", locationId: 476, flag: "🇫🇷" },
  { country: "France", city: "Strasbourg", locationId: 37, flag: "🇫🇷" },
  { country: "France", city: "Toulouse", locationId: 472, flag: "🇫🇷" },
  { country: "France", city: "Nantes", locationId: 474, flag: "🇫🇷" },
  { country: "France", city: "Lille", locationId: 37, flag: "🇫🇷" },
  { country: "France", city: "Versailles", locationId: 37, flag: "🇫🇷" },
  { country: "France", city: "Avignon", locationId: 473, flag: "🇫🇷" },
  { country: "France", city: "Annecy", locationId: 472, flag: "🇫🇷" },
  { country: "France", city: "Reims", locationId: 37, flag: "🇫🇷" },

  // Italy
  // Italy - Rome Districts
  { country: "Italy", city: "Rome", borough: "Centro Storico", locationId: 45, searchQuery: "Pantheon, Piazza Navona, Trevi Fountain", flag: "🇮🇹" },
  { country: "Italy", city: "Rome", borough: "Vatican City Area", locationId: 45, searchQuery: "Vatican Museums, St. Peter's Basilica, Sistine Chapel", flag: "🇮🇹" },
  { country: "Italy", city: "Rome", borough: "Colosseum Area", locationId: 45, searchQuery: "Colosseum, Roman Forum, Palatine Hill", flag: "🇮🇹" },
  { country: "Italy", city: "Rome", borough: "Trastevere", locationId: 45, searchQuery: "Trastevere neighborhood, Santa Maria", flag: "🇮🇹" },
  { country: "Italy", city: "Rome", borough: "Monti", locationId: 45, searchQuery: "Monti district, Via Cavour", flag: "🇮🇹" },
  // Italy - Venice Districts
  { country: "Italy", city: "Venice", borough: "San Marco", locationId: 46, searchQuery: "St Mark's Square, Basilica, Doge's Palace", flag: "🇮🇹" },
  { country: "Italy", city: "Venice", borough: "Cannaregio", locationId: 46, searchQuery: "Jewish Ghetto, Rialto Bridge area", flag: "🇮🇹" },
  { country: "Italy", city: "Venice", borough: "Dorsoduro", locationId: 46, searchQuery: "Accademia Gallery, Peggy Guggenheim", flag: "🇮🇹" },
  { country: "Italy", city: "Venice", borough: "Murano", locationId: 46, searchQuery: "Murano Glass, Island", flag: "🇮🇹" },
  { country: "Italy", city: "Venice", borough: "Burano", locationId: 46, searchQuery: "Colorful Houses, Lace, Island", flag: "🇮🇹" },
  // Italy - Florence Districts
  { country: "Italy", city: "Florence", borough: "Centro Storico", locationId: 47, searchQuery: "Duomo, Uffizi Gallery, Ponte Vecchio", flag: "🇮🇹" },
  { country: "Italy", city: "Florence", borough: "Oltrarno", locationId: 47, searchQuery: "Pitti Palace, Boboli Gardens, Artisan Workshops", flag: "🇮🇹" },
  { country: "Italy", city: "Florence", borough: "San Lorenzo", locationId: 47, searchQuery: "Central Market, Medici Chapels", flag: "🇮🇹" },
  // Italy - Milan Districts
  { country: "Italy", city: "Milan", borough: "Centro Storico", locationId: 48, searchQuery: "Duomo, Galleria Vittorio Emanuele II", flag: "🇮🇹" },
  { country: "Italy", city: "Milan", borough: "Brera", locationId: 48, searchQuery: "Brera Art Gallery, Bohemian Quarter", flag: "🇮🇹" },
  { country: "Italy", city: "Milan", borough: "Navigli", locationId: 48, searchQuery: "Canals, Nightlife, Restaurants", flag: "🇮🇹" },
  { country: "Italy", city: "Naples", locationId: 529, flag: "🇮🇹" },
  { country: "Italy", city: "Pisa", locationId: 530, flag: "🇮🇹" },
  { country: "Italy", city: "Verona", locationId: 531, flag: "🇮🇹" },
  { country: "Italy", city: "Bologna", locationId: 47, flag: "🇮🇹" },
  { country: "Italy", city: "Turin", locationId: 48, flag: "🇮🇹" },
  { country: "Italy", city: "Genoa", locationId: 48, flag: "🇮🇹" },
  { country: "Italy", city: "Amalfi Coast", locationId: 529, flag: "🇮🇹" },
  { country: "Italy", city: "Cinque Terre", locationId: 530, flag: "🇮🇹" },
  { country: "Italy", city: "Sicily", locationId: 532, flag: "🇮🇹" },

  // Germany
  // Germany - Berlin Districts
  { country: "Germany", city: "Berlin", borough: "Mitte", locationId: 49, searchQuery: "Brandenburg Gate, Museum Island, Reichstag", flag: "🇩🇪" },
  { country: "Germany", city: "Berlin", borough: "Kreuzberg", locationId: 49, searchQuery: "East Side Gallery, Kreuzberg nightlife", flag: "🇩🇪" },
  { country: "Germany", city: "Berlin", borough: "Friedrichshain", locationId: 49, searchQuery: "RAW-Gelände, Boxhagener Platz", flag: "🇩🇪" },
  { country: "Germany", city: "Berlin", borough: "Charlottenburg", locationId: 49, searchQuery: "Charlottenburg Palace, Kurfürstendamm", flag: "🇩🇪" },
  { country: "Germany", city: "Berlin", borough: "Prenzlauer Berg", locationId: 49, searchQuery: "Mauerpark, Kollwitzplatz", flag: "🇩🇪" },
  // Germany - Munich Districts
  { country: "Germany", city: "Munich", borough: "Altstadt", locationId: 50, searchQuery: "Marienplatz, Frauenkirche, Viktualienmarkt", flag: "🇩🇪" },
  { country: "Germany", city: "Munich", borough: "Maxvorstadt", locationId: 50, searchQuery: "Pinakothek Museums, University Quarter", flag: "🇩🇪" },
  { country: "Germany", city: "Munich", borough: "Schwabing", locationId: 50, searchQuery: "English Garden, Leopoldstrasse", flag: "🇩🇪" },
  { country: "Germany", city: "Hamburg", locationId: 577, flag: "🇩🇪" },
  { country: "Germany", city: "Frankfurt", locationId: 578, flag: "🇩🇪" },
  { country: "Germany", city: "Cologne", locationId: 579, flag: "🇩🇪" },
  { country: "Germany", city: "Dresden", locationId: 49, flag: "🇩🇪" },
  { country: "Germany", city: "Heidelberg", locationId: 578, flag: "🇩🇪" },
  { country: "Germany", city: "Nuremberg", locationId: 50, flag: "🇩🇪" },

  // Netherlands
  // Netherlands - Amsterdam Districts
  { country: "Netherlands", city: "Amsterdam", borough: "Centrum (City Center)", locationId: 51, searchQuery: "Dam Square, Red Light District, Anne Frank House", flag: "🇳🇱" },
  { country: "Netherlands", city: "Amsterdam", borough: "Jordaan", locationId: 51, searchQuery: "Jordaan neighborhood, Nine Streets", flag: "🇳🇱" },
  { country: "Netherlands", city: "Amsterdam", borough: "De Pijp", locationId: 51, searchQuery: "Albert Cuyp Market, Sarphatipark", flag: "🇳🇱" },
  { country: "Netherlands", city: "Amsterdam", borough: "Oud-West", locationId: 51, searchQuery: "Vondelpark, Museum Quarter", flag: "🇳🇱" },
  { country: "Netherlands", city: "Rotterdam", locationId: 580, flag: "🇳🇱" },
  { country: "Netherlands", city: "The Hague", locationId: 581, flag: "🇳🇱" },
  { country: "Netherlands", city: "Utrecht", locationId: 51, flag: "🇳🇱" },
  { country: "Netherlands", city: "Maastricht", locationId: 580, flag: "🇳🇱" },

  // Ireland
  // Ireland - Dublin Districts
  { country: "Ireland", city: "Dublin", borough: "Temple Bar", locationId: 52, searchQuery: "Temple Bar, Pubs, Nightlife", flag: "🇮🇪" },
  { country: "Ireland", city: "Dublin", borough: "Trinity College Area", locationId: 52, searchQuery: "Trinity College, Book of Kells, Grafton Street", flag: "🇮🇪" },
  { country: "Ireland", city: "Dublin", borough: "Guinness Storehouse Area", locationId: 52, searchQuery: "Guinness Storehouse, Kilmainham Gaol", flag: "🇮🇪" },
  { country: "Ireland", city: "Cork", locationId: 582, flag: "🇮🇪" },
  { country: "Ireland", city: "Galway", locationId: 583, flag: "🇮🇪" },
  { country: "Ireland", city: "Killarney", locationId: 582, flag: "🇮🇪" },
  { country: "Ireland", city: "Cliffs of Moher", locationId: 583, flag: "🇮🇪" },

  // Greece
  // Greece - Athens Districts
  { country: "Greece", city: "Athens", borough: "Plaka", locationId: 53, searchQuery: "Acropolis, Parthenon, Ancient Agora", flag: "🇬🇷" },
  { country: "Greece", city: "Athens", borough: "Monastiraki", locationId: 53, searchQuery: "Flea Market, Hadrian's Library", flag: "🇬🇷" },
  { country: "Greece", city: "Athens", borough: "Syntagma", locationId: 53, searchQuery: "Syntagma Square, Parliament, National Garden", flag: "🇬🇷" },
  { country: "Greece", city: "Santorini", locationId: 584, flag: "🇬🇷" },
  { country: "Greece", city: "Mykonos", locationId: 585, flag: "🇬🇷" },
  { country: "Greece", city: "Crete", locationId: 586, flag: "🇬🇷" },
  { country: "Greece", city: "Rhodes", locationId: 584, flag: "🇬🇷" },
  { country: "Greece", city: "Corfu", locationId: 584, flag: "🇬🇷" },
  { country: "Greece", city: "Thessaloniki", locationId: 53, flag: "🇬🇷" },

  // United States
  // United States - New York Boroughs
  { country: "United States", city: "New York", borough: "Manhattan", locationId: 1, searchQuery: "Times Square, Central Park, Empire State Building, Broadway", flag: "🇺🇸" },
  { country: "United States", city: "New York", borough: "Brooklyn", locationId: 1, searchQuery: "Brooklyn Bridge, DUMBO, Williamsburg, Coney Island", flag: "🇺🇸" },
  { country: "United States", city: "New York", borough: "Queens", locationId: 1, searchQuery: "Flushing, Astoria, Long Island City", flag: "🇺🇸" },
  { country: "United States", city: "New York", borough: "The Bronx", locationId: 1, searchQuery: "Yankee Stadium, Bronx Zoo, Botanical Garden", flag: "🇺🇸" },
  { country: "United States", city: "New York", borough: "Staten Island", locationId: 1, searchQuery: "Staten Island Ferry, Snug Harbor", flag: "🇺🇸" },
  // United States - Los Angeles Neighborhoods
  { country: "United States", city: "Los Angeles", borough: "Hollywood", locationId: 2, searchQuery: "Hollywood Walk of Fame, TCL Chinese Theatre", flag: "🇺🇸" },
  { country: "United States", city: "Los Angeles", borough: "Santa Monica", locationId: 2, searchQuery: "Santa Monica Pier, Beach, Third Street Promenade", flag: "🇺🇸" },
  { country: "United States", city: "Los Angeles", borough: "Beverly Hills", locationId: 2, searchQuery: "Rodeo Drive, Beverly Hills shopping", flag: "🇺🇸" },
  { country: "United States", city: "Los Angeles", borough: "Downtown LA", locationId: 2, searchQuery: "Grand Central Market, Arts District, Little Tokyo", flag: "🇺🇸" },
  { country: "United States", city: "Los Angeles", borough: "Venice Beach", locationId: 2, searchQuery: "Venice Beach Boardwalk, Canals", flag: "🇺🇸" },
  // United States - Las Vegas Areas
  { country: "United States", city: "Las Vegas", borough: "The Strip", locationId: 3, searchQuery: "Las Vegas Strip, Casinos, Shows", flag: "🇺🇸" },
  { country: "United States", city: "Las Vegas", borough: "Downtown", locationId: 3, searchQuery: "Fremont Street, Old Vegas", flag: "🇺🇸" },
  // United States - San Francisco Neighborhoods
  { country: "United States", city: "San Francisco", borough: "Fisherman's Wharf", locationId: 4, searchQuery: "Fisherman's Wharf, Pier 39, Alcatraz", flag: "🇺🇸" },
  { country: "United States", city: "San Francisco", borough: "Golden Gate", locationId: 4, searchQuery: "Golden Gate Bridge, Presidio", flag: "🇺🇸" },
  { country: "United States", city: "San Francisco", borough: "Union Square", locationId: 4, searchQuery: "Union Square, Cable Cars, Shopping", flag: "🇺🇸" },
  { country: "United States", city: "Miami", locationId: 5, flag: "🇺🇸" },
  { country: "United States", city: "Orlando", locationId: 6, flag: "🇺🇸" },
  { country: "United States", city: "Chicago", locationId: 7, flag: "🇺🇸" },
  { country: "United States", city: "Washington DC", locationId: 8, flag: "🇺🇸" },
  { country: "United States", city: "Boston", locationId: 9, flag: "🇺🇸" },
  { country: "United States", city: "Seattle", locationId: 10, flag: "🇺🇸" },
  { country: "United States", city: "Honolulu", locationId: 11, flag: "🇺🇸" },
  { country: "United States", city: "New Orleans", locationId: 5, flag: "🇺🇸" },
  { country: "United States", city: "San Diego", locationId: 2, flag: "🇺🇸" },
  { country: "United States", city: "Nashville", locationId: 7, flag: "🇺🇸" },
  { country: "United States", city: "Austin", locationId: 7, flag: "🇺🇸" },
  { country: "United States", city: "Philadelphia", locationId: 8, flag: "🇺🇸" },

  // United Arab Emirates
  // UAE - Dubai Districts
  { country: "United Arab Emirates", city: "Dubai", borough: "Downtown Dubai", locationId: 12, searchQuery: "Burj Khalifa, Dubai Mall, Dubai Fountain", flag: "🇦🇪" },
  { country: "United Arab Emirates", city: "Dubai", borough: "Dubai Marina", locationId: 12, searchQuery: "Marina Walk, JBR Beach, Yacht Club", flag: "🇦🇪" },
  { country: "United Arab Emirates", city: "Dubai", borough: "Palm Jumeirah", locationId: 12, searchQuery: "Atlantis, Palm Island, Beach Resorts", flag: "🇦🇪" },
  { country: "United Arab Emirates", city: "Dubai", borough: "Old Dubai", locationId: 12, searchQuery: "Gold Souk, Spice Souk, Dubai Creek", flag: "🇦🇪" },
  // UAE - Abu Dhabi Districts
  { country: "United Arab Emirates", city: "Abu Dhabi", borough: "Corniche", locationId: 13, searchQuery: "Corniche Beach, Emirates Palace", flag: "🇦🇪" },
  { country: "United Arab Emirates", city: "Abu Dhabi", borough: "Yas Island", locationId: 13, searchQuery: "Ferrari World, Yas Marina Circuit", flag: "🇦🇪" },
  { country: "United Arab Emirates", city: "Abu Dhabi", borough: "Saadiyat Island", locationId: 13, searchQuery: "Louvre Abu Dhabi, Beach", flag: "🇦🇪" },
  { country: "United Arab Emirates", city: "Sharjah", locationId: 12, flag: "🇦🇪" },

  // Japan
  // Japan - Tokyo Special Wards
  { country: "Japan", city: "Tokyo", borough: "Shibuya", locationId: 14, searchQuery: "Shibuya Crossing, Harajuku, Meiji Shrine", flag: "🇯🇵" },
  { country: "Japan", city: "Tokyo", borough: "Shinjuku", locationId: 14, searchQuery: "Shinjuku Station, Tokyo Metropolitan Government, Kabukicho", flag: "🇯🇵" },
  { country: "Japan", city: "Tokyo", borough: "Chiyoda", locationId: 14, searchQuery: "Imperial Palace, Tokyo Station, Akihabara", flag: "🇯🇵" },
  { country: "Japan", city: "Tokyo", borough: "Minato", locationId: 14, searchQuery: "Tokyo Tower, Roppongi, Odaiba", flag: "🇯🇵" },
  { country: "Japan", city: "Tokyo", borough: "Taito", locationId: 14, searchQuery: "Asakusa, Senso-ji Temple, Ueno Park", flag: "🇯🇵" },
  { country: "Japan", city: "Tokyo", borough: "Chuo", locationId: 14, searchQuery: "Ginza, Tsukiji, Nihonbashi", flag: "🇯🇵" },
  { country: "Japan", city: "Tokyo", borough: "Sumida", locationId: 14, searchQuery: "Tokyo Skytree, Ryogoku", flag: "🇯🇵" },
  { country: "Japan", city: "Tokyo", borough: "Meguro", locationId: 14, searchQuery: "Meguro River, Nakameguro", flag: "🇯🇵" },
  { country: "Japan", city: "Kyoto", locationId: 15, flag: "🇯🇵" },
  { country: "Japan", city: "Osaka", locationId: 16, flag: "🇯🇵" },

  // Thailand
  // Thailand - Bangkok Districts
  { country: "Thailand", city: "Bangkok", borough: "Rattanakosin", locationId: 17, searchQuery: "Grand Palace, Wat Pho, Wat Arun", flag: "🇹🇭" },
  { country: "Thailand", city: "Bangkok", borough: "Sukhumvit", locationId: 17, searchQuery: "Shopping, Nightlife, BTS Skytrain", flag: "🇹🇭" },
  { country: "Thailand", city: "Bangkok", borough: "Silom", locationId: 17, searchQuery: "Business District, Night Markets", flag: "🇹🇭" },
  { country: "Thailand", city: "Bangkok", borough: "Khao San Road", locationId: 17, searchQuery: "Backpacker Street, Street Food", flag: "🇹🇭" },
  { country: "Thailand", city: "Phuket", locationId: 18, flag: "🇹🇭" },
  { country: "Thailand", city: "Chiang Mai", locationId: 19, flag: "🇹🇭" },
  { country: "Thailand", city: "Pattaya", locationId: 17, flag: "🇹🇭" },
  { country: "Thailand", city: "Krabi", locationId: 18, flag: "🇹🇭" },
  { country: "Thailand", city: "Koh Samui", locationId: 18, flag: "🇹🇭" },

  // Singapore
  // Singapore - Districts
  { country: "Singapore", city: "Singapore", borough: "Marina Bay", locationId: 20, searchQuery: "Marina Bay Sands, Gardens by the Bay, Merlion", flag: "🇸🇬" },
  { country: "Singapore", city: "Singapore", borough: "Chinatown", locationId: 20, searchQuery: "Chinatown, Buddha Tooth Relic Temple", flag: "🇸🇬" },
  { country: "Singapore", city: "Singapore", borough: "Sentosa", locationId: 20, searchQuery: "Universal Studios, Beaches, Resorts", flag: "🇸🇬" },
  { country: "Singapore", city: "Singapore", borough: "Orchard Road", locationId: 20, searchQuery: "Shopping, Malls, Luxury Brands", flag: "🇸🇬" },

  // Australia
  // Australia - Sydney Neighborhoods
  { country: "Australia", city: "Sydney", borough: "Sydney Harbour", locationId: 21, searchQuery: "Opera House, Harbour Bridge, Circular Quay", flag: "🇦🇺" },
  { country: "Australia", city: "Sydney", borough: "Bondi Beach", locationId: 21, searchQuery: "Bondi Beach, Coastal Walk", flag: "🇦🇺" },
  { country: "Australia", city: "Sydney", borough: "The Rocks", locationId: 21, searchQuery: "Historic District, Markets, Pubs", flag: "🇦🇺" },
  { country: "Australia", city: "Sydney", borough: "Darling Harbour", locationId: 21, searchQuery: "Aquarium, Wildlife, Entertainment", flag: "🇦🇺" },
  { country: "Australia", city: "Melbourne", locationId: 22, flag: "🇦🇺" },
  { country: "Australia", city: "Brisbane", locationId: 23, flag: "🇦🇺" },
  { country: "Australia", city: "Gold Coast", locationId: 23, flag: "🇦🇺" },
  { country: "Australia", city: "Cairns", locationId: 23, flag: "🇦🇺" },
  { country: "Australia", city: "Perth", locationId: 21, flag: "🇦🇺" },

  // Egypt
  { country: "Egypt", city: "Cairo", locationId: 24, flag: "🇪🇬" },
  { country: "Egypt", city: "Luxor", locationId: 25, flag: "🇪🇬" },
  { country: "Egypt", city: "Aswan", locationId: 25, flag: "🇪🇬" },
  { country: "Egypt", city: "Hurghada", locationId: 24, flag: "🇪🇬" },
  { country: "Egypt", city: "Sharm El Sheikh", locationId: 24, flag: "🇪🇬" },
  { country: "Egypt", city: "Alexandria", locationId: 24, flag: "🇪🇬" },

  // Turkey
  // Turkey - Istanbul Districts
  { country: "Turkey", city: "Istanbul", borough: "Sultanahmet", locationId: 26, searchQuery: "Blue Mosque, Hagia Sophia, Topkapi Palace", flag: "🇹🇷" },
  { country: "Turkey", city: "Istanbul", borough: "Beyoglu", locationId: 26, searchQuery: "Taksim Square, Istiklal Street, Galata Tower", flag: "🇹🇷" },
  { country: "Turkey", city: "Istanbul", borough: "Bosphorus", locationId: 26, searchQuery: "Bosphorus Cruise, Ortakoy, Dolmabahce Palace", flag: "🇹🇷" },
  { country: "Turkey", city: "Antalya", locationId: 27, flag: "🇹🇷" },
  { country: "Turkey", city: "Cappadocia", locationId: 26, flag: "🇹🇷" },
  { country: "Turkey", city: "Bodrum", locationId: 27, flag: "🇹🇷" },
  { country: "Turkey", city: "Pamukkale", locationId: 27, flag: "🇹🇷" },

  // Morocco
  { country: "Morocco", city: "Marrakech", locationId: 28, flag: "🇲🇦" },
  { country: "Morocco", city: "Casablanca", locationId: 29, flag: "🇲🇦" },
  { country: "Morocco", city: "Fes", locationId: 28, flag: "🇲🇦" },
  { country: "Morocco", city: "Chefchaouen", locationId: 28, flag: "🇲🇦" },
  { country: "Morocco", city: "Essaouira", locationId: 28, flag: "🇲🇦" },
  { country: "Morocco", city: "Rabat", locationId: 29, flag: "🇲🇦" },

  // South Africa
  { country: "South Africa", city: "Cape Town", locationId: 30, flag: "🇿🇦" },
  { country: "South Africa", city: "Johannesburg", locationId: 31, flag: "🇿🇦" },
  { country: "South Africa", city: "Durban", locationId: 30, flag: "🇿🇦" },
  { country: "South Africa", city: "Kruger National Park", locationId: 31, flag: "🇿🇦" },
  { country: "South Africa", city: "Garden Route", locationId: 30, flag: "🇿🇦" },

  // Canada
  { country: "Canada", city: "Toronto", locationId: 32, flag: "🇨🇦" },
  { country: "Canada", city: "Vancouver", locationId: 33, flag: "🇨🇦" },
  { country: "Canada", city: "Montreal", locationId: 34, flag: "🇨🇦" },
  { country: "Canada", city: "Quebec City", locationId: 34, flag: "🇨🇦" },
  { country: "Canada", city: "Banff", locationId: 33, flag: "🇨🇦" },
  { country: "Canada", city: "Niagara Falls", locationId: 32, flag: "🇨🇦" },
  { country: "Canada", city: "Ottawa", locationId: 32, flag: "🇨🇦" },
  { country: "Canada", city: "Calgary", locationId: 33, flag: "🇨🇦" },

  // Mexico
  { country: "Mexico", city: "Cancun", locationId: 35, flag: "🇲🇽" },
  { country: "Mexico", city: "Mexico City", locationId: 36, flag: "🇲🇽" },
  { country: "Mexico", city: "Playa del Carmen", locationId: 35, flag: "🇲🇽" },
  { country: "Mexico", city: "Tulum", locationId: 35, flag: "🇲🇽" },
  { country: "Mexico", city: "Puerto Vallarta", locationId: 36, flag: "🇲🇽" },
  { country: "Mexico", city: "Cabo San Lucas", locationId: 36, flag: "🇲🇽" },
  { country: "Mexico", city: "Guadalajara", locationId: 36, flag: "🇲🇽" },

  // Brazil
  { country: "Brazil", city: "Rio de Janeiro", locationId: 587, flag: "🇧🇷" },
  { country: "Brazil", city: "Sao Paulo", locationId: 588, flag: "🇧🇷" },
  { country: "Brazil", city: "Salvador", locationId: 587, flag: "🇧🇷" },
  { country: "Brazil", city: "Brasilia", locationId: 588, flag: "🇧🇷" },
  { country: "Brazil", city: "Florianopolis", locationId: 587, flag: "🇧🇷" },

  // Argentina
  { country: "Argentina", city: "Buenos Aires", locationId: 589, flag: "🇦🇷" },

  // Iceland
  { country: "Iceland", city: "Reykjavik", locationId: 590, flag: "🇮🇸" },

  // Norway
  { country: "Norway", city: "Oslo", locationId: 591, flag: "🇳🇴" },

  // Sweden
  { country: "Sweden", city: "Stockholm", locationId: 592, flag: "🇸🇪" },

  // Denmark
  { country: "Denmark", city: "Copenhagen", locationId: 593, flag: "🇩🇰" },

  // Switzerland
  { country: "Switzerland", city: "Zurich", locationId: 594, flag: "🇨🇭" },
  { country: "Switzerland", city: "Geneva", locationId: 595, flag: "🇨🇭" },

  // Austria
  { country: "Austria", city: "Vienna", locationId: 596, flag: "🇦🇹" },
  { country: "Austria", city: "Salzburg", locationId: 597, flag: "🇦🇹" },

  // Belgium
  { country: "Belgium", city: "Brussels", locationId: 598, flag: "🇧🇪" },

  // Czech Republic
  { country: "Czech Republic", city: "Prague", locationId: 599, flag: "🇨🇿" },

  // Poland
  { country: "Poland", city: "Warsaw", locationId: 600, flag: "🇵🇱" },
  { country: "Poland", city: "Krakow", locationId: 601, flag: "🇵🇱" },

  // Croatia
  { country: "Croatia", city: "Dubrovnik", locationId: 602, flag: "🇭🇷" },
  { country: "Croatia", city: "Split", locationId: 603, flag: "🇭🇷" },

  // New Zealand
  { country: "New Zealand", city: "Auckland", locationId: 604, flag: "🇳🇿" },
  { country: "New Zealand", city: "Queenstown", locationId: 605, flag: "🇳🇿" },

  // India
  { country: "India", city: "Delhi", locationId: 606, flag: "🇮🇳" },
  { country: "India", city: "Mumbai", locationId: 607, flag: "🇮🇳" },
  { country: "India", city: "Agra", locationId: 608, flag: "🇮🇳" },

  // China
  { country: "China", city: "Beijing", locationId: 609, flag: "🇨🇳" },
  { country: "China", city: "Shanghai", locationId: 610, flag: "🇨🇳" },

  // South Korea
  { country: "South Korea", city: "Seoul", locationId: 611, flag: "🇰🇷" },

  // Vietnam
  { country: "Vietnam", city: "Hanoi", locationId: 612, flag: "🇻🇳" },
  { country: "Vietnam", city: "Ho Chi Minh City", locationId: 613, flag: "🇻🇳" },

  // Malaysia
  { country: "Malaysia", city: "Kuala Lumpur", locationId: 614, flag: "🇲🇾" },

  // Indonesia
  { country: "Indonesia", city: "Bali", locationId: 615, flag: "🇮🇩" },
  { country: "Indonesia", city: "Jakarta", locationId: 616, flag: "🇮🇩" },

  // Philippines
  { country: "Philippines", city: "Manila", locationId: 617, flag: "🇵🇭" },
];

export default function FindActivitiesTours() {
  const { language } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique countries with their flags and destination counts
  const countries = useMemo(() => {
    const countryMap = new Map<string, { flag: string; count: number }>();
    DESTINATIONS.forEach(dest => {
      const existing = countryMap.get(dest.country);
      if (existing) {
        existing.count++;
      } else {
        countryMap.set(dest.country, { flag: dest.flag, count: 1 });
      }
    });
    return Array.from(countryMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Get unique cities for selected country
  const cities = useMemo(() => {
    if (!selectedCountry) return [];
    const cityMap = new Map<string, number>();
    DESTINATIONS.filter(dest => dest.country === selectedCountry).forEach(dest => {
      const count = cityMap.get(dest.city) || 0;
      cityMap.set(dest.city, count + 1);
    });
    return Array.from(cityMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedCountry]);

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!searchQuery || selectedCity) return cities;
    return cities.filter(city => 
      city.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [cities, searchQuery, selectedCity]);

  // Get boroughs/districts for selected city
  const boroughs = useMemo(() => {
    if (!selectedCountry || !selectedCity) return [];
    return DESTINATIONS
      .filter(dest => dest.country === selectedCountry && dest.city === selectedCity && dest.borough)
      .sort((a, b) => (a.borough || '').localeCompare(b.borough || ''));
  }, [selectedCountry, selectedCity]);

  // Get destinations without boroughs for selected city
  const cityDestinations = useMemo(() => {
    if (!selectedCountry || !selectedCity) return [];
    return DESTINATIONS
      .filter(dest => dest.country === selectedCountry && dest.city === selectedCity && !dest.borough);
  }, [selectedCountry, selectedCity]);

  // Search countries
  const filteredCountries = useMemo(() => {
    if (!searchQuery || selectedCountry) return countries;
    return countries.filter(country => 
      country.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [countries, searchQuery, selectedCountry]);

  const handleCountrySelect = (countryName: string) => {
    setSelectedCountry(countryName);
    setSelectedCity(null);
    setSearchQuery('');
  };

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    setSearchQuery('');
  };

  const handleBack = () => {
    if (selectedCity) {
      setSelectedCity(null);
    } else if (selectedCountry) {
      setSelectedCountry(null);
    }
    setSearchQuery('');
  };

  const handleBookActivity = (destination: Destination) => {
    const partnerId = 'JAGROUPSERVICESLTD';
    const locale = 'en-GB';
    const currency = 'GBP';
    const searchTerm = destination.searchQuery || destination.city;
    const url = `https://www.getyourguide.com/s/?q=${encodeURIComponent(searchTerm)}&partner_id=${partnerId}&locale=${locale}&currency=${currency}&locationId=${destination.locationId}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <Link to="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              {t('activitiesPage.title', language)}
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              {selectedCity
                ? `Explore ${boroughs.length > 0 ? boroughs.length + ' boroughs/districts' : 'activities'} in ${selectedCity}`
                : selectedCountry 
                ? `Explore ${filteredCities.length} cities in ${selectedCountry}`
                : t('activitiesPage.subtitle', language)
              }
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder={selectedCity ? t('activitiesPage.search', language) : selectedCountry ? t('activitiesPage.search', language) : t('activitiesPage.search', language)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-12 py-6 text-lg text-gray-900 bg-white/95 backdrop-blur-sm border-0 shadow-xl placeholder:text-gray-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {!selectedCountry ? (
            /* Country Selection Grid */
            <motion.div
              key="countries"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCountries.map((country, index) => (
                  <motion.div
                    key={country.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card 
                      className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-300 bg-white/80 backdrop-blur-sm overflow-hidden"
                      onClick={() => handleCountrySelect(country.name)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                            {country.flag}
                          </span>
                          <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                          {country.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {country.count} {country.count === 1 ? 'destination' : 'destinations'}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {filteredCountries.length === 0 && (
                <div className="text-center py-16">
                  <Globe2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-500">No countries found matching "{searchQuery}"</p>
                </div>
              )}
            </motion.div>
          ) : !selectedCity ? (
            /* City Selection Grid */
            <motion.div
              key="cities"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="mb-6"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Countries
                </Button>

                <div className="flex items-center gap-4 mb-4">
                  <span className="text-6xl">{countries.find(c => c.name === selectedCountry)?.flag}</span>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{selectedCountry}</h2>
                    <p className="text-gray-600">{cities.length} cities available</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* View All Option for Country */}
                <motion.div
                  key="view-all-country"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 }}
                >
                  <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 h-full">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <Globe2 className="h-8 w-8 text-purple-600 flex-shrink-0" />
                      </div>
                      <h3 className="text-lg font-bold text-purple-900 mb-2 flex-grow">
                        View All Activities
                      </h3>
                      <p className="text-sm text-purple-700 mb-4">
                        Browse all {DESTINATIONS.filter(d => d.country === selectedCountry).length} activities in {selectedCountry}
                      </p>
                      <Button
                        onClick={() => {
                          const firstDestination = DESTINATIONS.find(d => d.country === selectedCountry);
                          if (firstDestination) handleBookActivity(firstDestination);
                        }}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        View All Activities
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                {filteredCities.map((city, index) => (
                  <motion.div
                    key={`${selectedCountry}-${city.name}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (index + 1) * 0.02 }}
                  >
                    <Card 
                      className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-300 bg-white/80 backdrop-blur-sm h-full"
                      onClick={() => handleCitySelect(city.name)}
                    >
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                          <MapPin className="h-6 w-6 text-purple-600 flex-shrink-0" />
                          <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 flex-grow group-hover:text-purple-600 transition-colors">
                          {city.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {city.count} {city.count === 1 ? 'location' : 'locations'}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {filteredCities.length === 0 && (
                <div className="text-center py-16">
                  <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-500">No cities found matching "{searchQuery}"</p>
                </div>
              )}
            </motion.div>
          ) : (
            /* Borough/District Selection or Direct Activities */
            <motion.div
              key="boroughs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="mb-6"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to {selectedCountry}
                </Button>

                <div className="flex items-center gap-4 mb-4">
                  <MapPin className="h-12 w-12 text-purple-600" />
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{selectedCity}</h2>
                    <p className="text-gray-600">
                      {boroughs.length > 0 
                        ? `${boroughs.length} boroughs/districts` 
                        : `${cityDestinations.length} activities available`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {boroughs.length > 0 ? (
                /* Show Boroughs/Districts */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {/* View All Option for City */}
                  <motion.div
                    key="view-all-city"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                  >
                    <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 h-full">
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                          <MapPin className="h-8 w-8 text-purple-600 flex-shrink-0" />
                        </div>
                        <h3 className="text-lg font-bold text-purple-900 mb-2 flex-grow">
                          View All Activities
                        </h3>
                        <p className="text-sm text-purple-700 mb-4">
                          Browse all activities in {selectedCity}
                        </p>
                        <Button
                          onClick={() => {
                            const firstDestination = DESTINATIONS.find(d => d.country === selectedCountry && d.city === selectedCity);
                            if (firstDestination) handleBookActivity(firstDestination);
                          }}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        >
                          View All Activities
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {boroughs.map((destination, index) => (
                    <motion.div
                      key={`${destination.country}-${destination.city}-${destination.borough}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (index + 1) * 0.02 }}
                    >
                      <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-300 bg-white/80 backdrop-blur-sm h-full">
                        <CardContent className="p-6 flex flex-col h-full">
                          <div className="flex items-start justify-between mb-4">
                            <MapPin className="h-6 w-6 text-purple-600 flex-shrink-0" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-4 flex-grow group-hover:text-purple-600 transition-colors">
                            {destination.borough}
                          </h3>
                          <Button
                            onClick={() => handleBookActivity(destination)}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                          >
                            View Activities
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                /* Show Direct Activities (no boroughs) */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {cityDestinations.map((destination, index) => (
                    <motion.div
                      key={`${destination.country}-${destination.city}-${destination.locationId}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-300 bg-white/80 backdrop-blur-sm h-full">
                        <CardContent className="p-6 flex flex-col h-full">
                          <div className="flex items-start justify-between mb-4">
                            <MapPin className="h-6 w-6 text-purple-600 flex-shrink-0" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-4 flex-grow group-hover:text-purple-600 transition-colors">
                            {destination.city}
                          </h3>
                          <Button
                            onClick={() => handleBookActivity(destination)}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                          >
                            View Activities
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Affiliate Disclosure */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-blue-50/80 backdrop-blur-sm border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Affiliate Partnership Disclosure</h3>
            <p className="text-sm text-blue-800">
              JA Group Services Ltd is an affiliate partner of GetYourGuide. When you book activities through our links, 
              we may earn a commission at no additional cost to you. This helps us maintain and improve our services. 
              All prices shown are in British Pounds (£) and are provided by GetYourGuide.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
