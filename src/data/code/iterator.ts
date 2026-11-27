// Dữ liệu cứng: mã nguồn ví dụ iterator (TypeScript + Java) và output đã chạy thật.
export const iterator = {
  javaFile: "IteratorDemo.java",
  tsOutput: [
    "▶ Nơi này có anh — Sơn Tùng",
    "▶ Hoa nở không màu — Hoài Lâm",
    "▶ See tình — Hoàng Thuỳ Linh",
    "▶ Waiting for you — MONO",
    "Bỏ qua 1 bài: Nơi này có anh, See tình",
    "for…of: Sơn Tùng | Hoài Lâm | Hoàng Thuỳ Linh | MONO",
  ],
  javaOutput: [
    "▶ Nơi này có anh — Sơn Tùng",
    "▶ Hoa nở không màu — Hoài Lâm",
    "▶ See tình — Hoàng Thuỳ Linh",
    "▶ Waiting for you — MONO",
    "Bỏ qua 1 bài: Nơi này có anh, See tình",
    "for-each: Sơn Tùng | Hoài Lâm | Hoàng Thuỳ Linh | MONO",
  ],
  typescript: `interface Song {
  title: string;
  artist: string;
}

// Iterator
interface Iterator<T> {
  hasNext(): boolean;
  next(): T;
}

// IterableCollection
interface IterableCollection<T> {
  createIterator(): Iterator<T>;
}

// ConcreteIterator: giữ vị trí, che giấu cấu trúc bên trong
class PlaylistIterator implements Iterator<Song> {
  private playlist: Playlist;
  private index = 0;
  private step: number;

  constructor(playlist: Playlist, step = 1) {
    this.playlist = playlist;
    this.step = step;
  }

  hasNext() {
    return this.index < this.playlist.count();
  }

  next(): Song {
    const song = this.playlist.at(this.index);
    this.index += this.step;
    return song;
  }
}

// ConcreteCollection
class Playlist implements IterableCollection<Song> {
  private songs: Song[] = [];

  add(song: Song): this {
    this.songs.push(song);
    return this;
  }

  count() {
    return this.songs.length;
  }

  at(i: number) {
    return this.songs[i];
  }

  createIterator(): Iterator<Song> {
    return new PlaylistIterator(this);
  }

  createSkipIterator(): Iterator<Song> {
    return new PlaylistIterator(this, 2);
  }

  // Tích hợp giao thức chuẩn của JS → dùng được for…of và spread
  *[Symbol.iterator]() {
    const it = this.createIterator();
    while (it.hasNext()) yield it.next();
  }
}

const playlist = new Playlist()
  .add({ title: "Nơi này có anh", artist: "Sơn Tùng" })
  .add({ title: "Hoa nở không màu", artist: "Hoài Lâm" })
  .add({ title: "See tình", artist: "Hoàng Thuỳ Linh" })
  .add({ title: "Waiting for you", artist: "MONO" });

// Client chỉ dùng hasNext()/next() — không biết bên trong là mảng
const it = playlist.createIterator();
while (it.hasNext()) {
  const s = it.next();
  console.log(\`▶ \${s.title} — \${s.artist}\`);
}

const skip = playlist.createSkipIterator();
const picked: string[] = [];
while (skip.hasNext()) picked.push(skip.next().title);
console.log("Bỏ qua 1 bài:", picked.join(", "));

console.log("for…of:", [...playlist].map((s) => s.artist).join(" | "));`,
  java: `import java.util.ArrayList;
import java.util.List;

public class IteratorDemo {
    public static void main(String[] args) {
        Playlist playlist = new Playlist()
            .add(new Song("Nơi này có anh", "Sơn Tùng"))
            .add(new Song("Hoa nở không màu", "Hoài Lâm"))
            .add(new Song("See tình", "Hoàng Thuỳ Linh"))
            .add(new Song("Waiting for you", "MONO"));

        // Client chỉ dùng hasNext()/next() — không biết bên trong là List
        SongIterator it = playlist.createIterator();
        while (it.hasNext()) {
            Song s = it.next();
            System.out.println("▶ " + s.title() + " — " + s.artist());
        }

        SongIterator skip = playlist.createSkipIterator();
        List<String> picked = new ArrayList<>();
        while (skip.hasNext()) picked.add(skip.next().title());
        System.out.println("Bỏ qua 1 bài: " + String.join(", ", picked));

        // Hiện thực java.lang.Iterable → dùng được for-each
        List<String> artists = new ArrayList<>();
        for (Song s : playlist) artists.add(s.artist());
        System.out.println("for-each: " + String.join(" | ", artists));
    }
}

record Song(String title, String artist) {}

// Iterator
interface SongIterator {
    boolean hasNext();
    Song next();
}

// IterableCollection
interface SongCollection {
    SongIterator createIterator();
}

// ConcreteIterator: giữ vị trí, che giấu cấu trúc bên trong
class PlaylistIterator implements SongIterator {
    private final Playlist playlist;
    private final int step;
    private int index = 0;

    PlaylistIterator(Playlist playlist, int step) {
        this.playlist = playlist;
        this.step = step;
    }

    public boolean hasNext() { return index < playlist.count(); }

    public Song next() {
        Song song = playlist.at(index);
        index += step;
        return song;
    }
}

// ConcreteCollection
class Playlist implements SongCollection, Iterable<Song> {
    private final List<Song> songs = new ArrayList<>();

    Playlist add(Song song) {
        songs.add(song);
        return this;
    }

    int count() { return songs.size(); }
    Song at(int i) { return songs.get(i); }

    public SongIterator createIterator() { return new PlaylistIterator(this, 1); }
    SongIterator createSkipIterator() { return new PlaylistIterator(this, 2); }

    // Cầu nối sang giao thức chuẩn của Java
    @Override
    public java.util.Iterator<Song> iterator() {
        SongIterator it = createIterator();
        return new java.util.Iterator<>() {
            public boolean hasNext() { return it.hasNext(); }
            public Song next() { return it.next(); }
        };
    }
}`,
};
