import type { Category, CollectionItem, RecommendationContext } from '~/types/domain'

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-tshirts', name: 'Camisetas', kind: 'garment', role: 'top', custom: false },
  { id: 'cat-shirts', name: 'Camisas', kind: 'garment', role: 'top', custom: false },
  { id: 'cat-trousers', name: 'Calças', kind: 'garment', role: 'bottom', custom: false },
  { id: 'cat-outerwear', name: 'Terceira peça', kind: 'garment', role: 'outer_layer', custom: false },
  { id: 'cat-footwear', name: 'Calçados', kind: 'garment', role: 'footwear', custom: false },
  { id: 'cat-accessories', name: 'Acessórios', kind: 'garment', role: 'accessory', custom: false },
  { id: 'cat-scents', name: 'Perfumes', kind: 'scent', role: 'scent', custom: false }
]

export const RECOMMENDATION_CONTEXTS: RecommendationContext[] = [
  {
    id: 'everyday',
    label: 'Dia a dia',
    eyebrow: 'Rotina',
    description: 'Resolver o dia sem parecer que a roupa foi escolhida no escuro.',
    targetFormality: 1,
    requiredRoles: ['top', 'bottom', 'footwear']
  },
  {
    id: 'work',
    label: 'Trabalho',
    eyebrow: 'Presença',
    description: 'Mais estrutura e projeção contida para dividir espaço com outras pessoas.',
    targetFormality: 2,
    requiredRoles: ['top', 'bottom', 'footwear', 'outer_layer']
  },
  {
    id: 'date',
    label: 'Encontro',
    eyebrow: 'Proximidade',
    description: 'Textura, intenção e um perfume que funciona a curta distância.',
    targetFormality: 2,
    requiredRoles: ['top', 'bottom', 'footwear']
  },
  {
    id: 'event',
    label: 'Evento',
    eyebrow: 'Ocasião',
    description: 'Uma combinação com mais contraste e formalidade, sem virar uniforme.',
    targetFormality: 3,
    requiredRoles: ['top', 'bottom', 'footwear', 'outer_layer']
  }
]

export const DEMO_ITEMS: CollectionItem[] = [
  {
    id: 'item-tee', kind: 'garment', ownership: 'owned', categoryId: 'cat-tshirts',
    name: 'Camiseta pesada', brand: 'Sem marca', description: 'Algodão encorpado, gola fechada.',
    currency: 'BRL', price: 129, color: 'Off-white', colorHex: '#d8d2c4', size: 'M',
    material: 'Algodão 240 g/m²', formality: 1, climates: ['hot', 'mild'],
    contexts: ['everyday', 'work', 'date'], styleTags: ['workwear', 'minimal']
  },
  {
    id: 'item-shirt', kind: 'garment', ownership: 'owned', categoryId: 'cat-shirts',
    name: 'Camisa oxford', brand: 'Acervo', description: 'Colarinho macio e corte reto.',
    currency: 'BRL', price: 279, color: 'Azul claro', colorHex: '#9caeb2', size: 'M',
    material: 'Algodão oxford', formality: 2, climates: ['mild', 'cold'],
    contexts: ['work', 'date', 'event'], styleTags: ['classic', 'workwear']
  },
  {
    id: 'item-trouser', kind: 'garment', ownership: 'owned', categoryId: 'cat-trousers',
    name: 'Calça reta', brand: 'Acervo', description: 'Cintura média e abertura de barra ampla.',
    currency: 'BRL', price: 349, color: 'Chumbo', colorHex: '#4c4c49', size: '40',
    material: 'Sarja 9 oz', formality: 2, climates: ['hot', 'mild', 'cold'],
    contexts: ['everyday', 'work', 'date', 'event'], styleTags: ['workwear', 'classic'],
    lastWornAt: '2026-08-16'
  },
  {
    id: 'item-jeans', kind: 'garment', ownership: 'owned', categoryId: 'cat-trousers',
    name: 'Jeans índigo', brand: 'Acervo', description: 'Denim rígido e perna reta.',
    currency: 'BRL', price: 399, color: 'Índigo', colorHex: '#263b4a', size: '40',
    material: 'Denim 11 oz', formality: 1, climates: ['mild', 'cold'],
    contexts: ['everyday', 'date'], styleTags: ['streetwear', 'workwear']
  },
  {
    id: 'item-jacket', kind: 'garment', ownership: 'owned', categoryId: 'cat-outerwear',
    name: 'Jaqueta de trabalho', brand: 'Acervo', description: 'Quatro bolsos e estrutura leve.',
    currency: 'BRL', price: 579, color: 'Tabaco', colorHex: '#75543c', size: 'M',
    material: 'Sarja 10 oz', formality: 2, climates: ['mild', 'cold'],
    contexts: ['everyday', 'work', 'date'], styleTags: ['workwear']
  },
  {
    id: 'item-loafer', kind: 'garment', ownership: 'owned', categoryId: 'cat-footwear',
    name: 'Mocassim de couro', brand: 'Acervo', description: 'Forma arredondada e sola baixa.',
    currency: 'BRL', price: 690, color: 'Marrom escuro', colorHex: '#3d2c24', size: '41',
    material: 'Couro', formality: 3, climates: ['hot', 'mild', 'cold'],
    contexts: ['work', 'date', 'event'], styleTags: ['classic']
  },
  {
    id: 'item-sneaker', kind: 'garment', ownership: 'owned', categoryId: 'cat-footwear',
    name: 'Tênis de lona', brand: 'Acervo', description: 'Perfil baixo e poucos detalhes.',
    currency: 'BRL', price: 320, color: 'Preto', colorHex: '#171715', size: '41',
    material: 'Lona', formality: 1, climates: ['hot', 'mild'],
    contexts: ['everyday', 'date'], styleTags: ['streetwear', 'minimal']
  },
  {
    id: 'item-vetiver', kind: 'scent', ownership: 'owned', categoryId: 'cat-scents',
    name: 'Vetiver diário', brand: 'Acervo olfativo', description: 'Seco, verde e discreto.',
    currency: 'BRL', price: 420, formality: 2, climates: ['hot', 'mild'],
    contexts: ['everyday', 'work'], styleTags: ['woody', 'green'], concentration: 'EDT',
    volumeMl: 100, remainingPercent: 64, projection: 'moderate'
  },
  {
    id: 'item-amber', kind: 'scent', ownership: 'owned', categoryId: 'cat-scents',
    name: 'Âmbar noturno', brand: 'Acervo olfativo', description: 'Quente, resinoso e próximo.',
    currency: 'BRL', price: 590, formality: 3, climates: ['mild', 'cold'],
    contexts: ['date', 'event'], styleTags: ['amber', 'warm'], concentration: 'EDP',
    volumeMl: 75, remainingPercent: 82, projection: 'moderate'
  },
  {
    id: 'wish-boot', kind: 'garment', ownership: 'wishlist', categoryId: 'cat-footwear',
    name: 'Bota de serviço', brand: 'Lista de desejo', description: 'Couro marrom e sola costurada.',
    currency: 'BRL', price: 890, color: 'Marrom', colorHex: '#5c4031', size: '41',
    material: 'Couro', formality: 2, climates: ['mild', 'cold'],
    contexts: ['everyday', 'work'], styleTags: ['workwear']
  },
  {
    id: 'wish-citrus', kind: 'scent', ownership: 'wishlist', categoryId: 'cat-scents',
    name: 'Cítrico mineral', brand: 'Lista de desejo', description: 'Para testar antes do verão.',
    currency: 'BRL', price: 480, formality: 1, climates: ['hot'],
    contexts: ['everyday', 'work'], styleTags: ['citrus', 'mineral'], concentration: 'EDT',
    volumeMl: 100, projection: 'low'
  }
]
