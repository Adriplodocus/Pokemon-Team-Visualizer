import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))

from fetch_pmd_portraits import normalize_name, parse_credit_names

def test_normalize_basic():
    assert normalize_name('Bulbasaur') == 'bulbasaur'

def test_normalize_spaces():
    assert normalize_name('Mr. Mime') == 'mr_mime'

def test_normalize_apostrophe():
    assert normalize_name("Farfetch'd") == 'farfetchd'

def test_normalize_dot():
    assert normalize_name('Porygon-Z') == 'porygon-z'

def test_parse_credit_names_basic():
    tsv = "Name\tDiscord\tContact\nArtistA\t#handle\thttps://example.com\nArtistB\t<@123>\t"
    result = parse_credit_names(tsv)
    assert result['ArtistA'] == {'discord': '#handle', 'contact': 'https://example.com'}
    assert result['ArtistB'] == {'discord': '<@123>', 'contact': ''}

def test_parse_credit_names_skips_header():
    tsv = "Name\tDiscord\tContact\nX\t\t"
    result = parse_credit_names(tsv)
    assert 'Name' not in result

def test_parse_credit_names_empty_lines():
    tsv = "Name\tDiscord\tContact\n\nArtistA\tD\tC\n"
    result = parse_credit_names(tsv)
    assert list(result.keys()) == ['ArtistA']
