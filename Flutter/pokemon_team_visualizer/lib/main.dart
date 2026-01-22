import 'package:flutter/material.dart';
import 'package:window_manager/window_manager.dart';

//Classes
import 'pokemon.dart';
import 'constants.dart';
import 'pokemon_catalog.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Inicializamos window_manager
  await windowManager.ensureInitialized();

  // Configuración de la ventana
  WindowOptions windowOptions = const WindowOptions(
    title: APP_TITLE,
    size: Size(WINDOW_WIDTH, WINDOW_HEIGHT),
    center: true,
  );

  windowManager.waitUntilReadyToShow(windowOptions, () async {
    await windowManager.show();
    await windowManager.focus();
  });

  runApp(const MainApp());
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      home: HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final int numPokemon = 6;

  // Lista de objetos Pokémon
  late final List<Pokemon> pokemons =
      List.generate(numPokemon, (_) => Pokemon());

  // Controllers para manejar inputs dinámicos
  late final List<TextEditingController> _nombreControllers =
      List.generate(numPokemon, (_) => TextEditingController());
  late final List<TextEditingController> _moteControllers =
      List.generate(numPokemon, (_) => TextEditingController());

  @override
  void dispose() {
    for (var c in _nombreControllers) {
      c.dispose();
    }
    for (var c in _moteControllers) {
      c.dispose();
    }
    super.dispose();
  }

String log = "";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            children: [

              ...List.generate(numPokemon, (index) {
  final currentPokemon = pokemons[index];

final specificProps = pokemonProperties[currentPokemon.nombre];

final props = {
  'boolean': [
    ...commonProps['boolean']!,
    if (specificProps != null && specificProps.containsKey('boolean'))
      ...specificProps['boolean']
  ],

  'gender': commonProps['gender']!,

  'region': [
    ...commonProps['region']!,
    if (specificProps != null && specificProps.containsKey('region'))
      ...specificProps['region']
  ],

  'colors': specificProps != null && specificProps.containsKey('colors')
      ? specificProps['colors']
      : commonProps['colors'],
};

final genderItems = props['gender'] as List<String>;
final currentGender = genderItems.contains(currentPokemon.gender)
    ? currentPokemon.gender
    : genderItems[0];

final regionItems = (props['region'] as List).cast<String>();
final currentRegion = regionItems.contains(currentPokemon.region)
    ? currentPokemon.region
    : regionItems[0];

final colorItems = props['colors'] as List<String>;
final currentColor = colorItems.contains(currentPokemon.color)
    ? currentPokemon.color
    : colorItems[0];

  return Padding(
    padding: const EdgeInsets.only(bottom: 16),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Row de nombre y mote
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _nombreControllers[index],
                decoration: InputDecoration(
                  labelText: 'Pokémon ${index + 1}:',
                  border: const OutlineInputBorder(),
                ),
                onChanged: (value) {
                  setState(() {
                    currentPokemon.nombre = value;

                    //Reset
                    currentPokemon.isMega = false;
                    currentPokemon.region = currentRegion;
                    currentPokemon.color = currentColor;
                  });
                },
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: TextField(
                controller: _moteControllers[index],
                decoration: InputDecoration(
                  labelText: 'Mote ${index + 1}:',
                  border: const OutlineInputBorder(),
                ),
                onChanged: (value) {
                  setState(() {
                    currentPokemon.mote = value;
                  });
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        // Row de propiedades
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Propiedades comunes
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Text("Gender: "),
                      DropdownButton<String>(
                        value: currentGender,
                        items: genderItems
                            .map((g) => DropdownMenuItem(
                                value: g, child: Text(g)))
                            .toList(),
                        onChanged: (val) {
                          setState(() {
                            currentPokemon.gender = val!;
                          });
                        },
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Checkbox(
                        value: currentPokemon.isShiny,
                        onChanged: (val) {
                          setState(() {
                            currentPokemon.isShiny = val!;
                          });
                        },
                      ),
                      const Text("Shiny"),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            // Propiedades específicas
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (props['boolean']!
                      .any((b) => b != 'shiny')) // excluimos shiny
                    ...props['boolean']!
                        .where((b) => b != 'shiny')
                        .map(
                          (b) => Row(
                          ),
                        ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Text("Color: "),
                      DropdownButton<String>(
                        value: currentColor,
                        items: colorItems
                            .map((c) => DropdownMenuItem(
                                value: c, child: Text(c)))
                            .toList(),
                        onChanged: (val) {
                          setState(() {
                            currentPokemon.color = val!;
                          });
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Text("Region: "),
                      DropdownButton<String>(
                        value: currentRegion,
                        items: regionItems
                            .map((c) => DropdownMenuItem(
                                value: c, child: Text(c)))
                            .toList(),
                        onChanged: (val) {
                          setState(() {
                            currentPokemon.region = val!;
                          });
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    ),
  );
}),


              ElevatedButton(
                onPressed: () {
                  setState(() {
                    for (int i = 0; i < numPokemon; i++) {
                      pokemons[i].nombre = _nombreControllers[i].text;
                      pokemons[i].mote = _moteControllers[i].text;
                    }
                  });
                },
                child: const Text('Mostrar log'),
              ),
              const SizedBox(height: 16),
                  Text(log),
            ],
          ),
        ),
      ),
    );
  }
}