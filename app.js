// Variables globales
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const loadingContainer = document.getElementById('loading-container');
const loadingBar = document.getElementById('loading-bar');
let loadedCount = 0;
let loadingPercentage = document.getElementById('loading-percentage');
// Función para cargar texturas de Pokémon
async function loadPokemonTexture(pokemonId, totalPokemon) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
  const data = await response.json();
  const textureLoader = new THREE.TextureLoader();
  const texture = await new Promise((resolve, reject) => {
    textureLoader.load(
      data.sprites.front_default,
      (texture) => {
        loadedCount++;
        const progress = (loadedCount / totalPokemon) * 100;
        loadingPercentage.innerHTML = `${progress.toFixed(0)}%`; // Actualizar el porcentaje de carga
        if (progress === 100) {
          loadingContainer.style.display = 'none';
        }
        resolve(texture);
      },
      undefined,
      (error) => {
        console.error('Error al cargar la textura:', error);
        reject(error);
      }
    );
  });
  return texture;
}
// Función para crear un Pokémon en 3D
async function createPokemon(pokemonId, totalPokemon) {
  const geometry = new THREE.PlaneGeometry(1, 1);
  const texture = await loadPokemonTexture(pokemonId, totalPokemon);
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
  const pokemon = new THREE.Mesh(geometry, material);
  pokemon.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
  pokemon.velocity = new THREE.Vector3(Math.random() * 0.01, Math.random() * 0.01, Math.random() * 0.01);
  return pokemon;
}
// Crear Pokémons en la escena
(async () => {
  const pokemons = [];
  const totalPokemon = 898; // Número total de Pokémon hasta la generación 8

  for (let i = 1; i <= totalPokemon; i++) {
    const pokemon = await createPokemon(i, totalPokemon);
    pokemons.push(pokemon);
    scene.add(pokemon);
  }

  camera.position.z = 10;

  const animate = function () {
    requestAnimationFrame(animate);


    pokemons.forEach((pokemon) => {
      pokemon.position.add(pokemon.velocity);

      if (pokemon.position.x > 5 || pokemon.position.x < -5) {
        pokemon.velocity.x = -pokemon.velocity.x;
      }
      if (pokemon.position.y > 5 || pokemon.position.y < -5) {
        pokemon.velocity.y = -pokemon.velocity.y;
      }
      if (pokemon.position.z > 5 || pokemon.position.z < -5) {
        pokemon.velocity.z = -pokemon.velocity.z;
      }
    });

    renderer.render(scene, camera);
  };

  animate();
})();