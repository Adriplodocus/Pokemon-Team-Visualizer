class Pokemon {
  String nombre;
  String mote;

  String gender;

  bool isShiny;
  bool isMega;
  
  String region;
  String color;

  Pokemon({
    this.nombre = '',
    this.mote = '',

    this.gender = 'male',

    this.isShiny = false,
    this.isMega = false,
    
    this.region = '',

    this.color = ''
  });
}