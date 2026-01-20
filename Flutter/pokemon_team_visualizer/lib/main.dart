import 'package:flutter/material.dart';
import 'package:window_manager/window_manager.dart';

//Classes
import 'pokemon.dart';
import 'constants.dart';

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            children: [
              ...List.generate(numPokemon, (index) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _nombreControllers[index],
                          decoration: InputDecoration(
                            labelText: 'Pokémon ${index + 1}:',
                            border: const OutlineInputBorder(),
                          ),
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
                        ),
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
                child: const Text('Mostrar valores'),
              ),
              const SizedBox(height: 16),
              ...pokemons.map((p) => Text(
                  'Pokémon: ${p.nombre.isEmpty ? "-" : p.nombre} - Mote: ${p.mote.isEmpty ? "-" : p.mote}')),
            ],
          ),
        ),
      ),
    );
  }
}
