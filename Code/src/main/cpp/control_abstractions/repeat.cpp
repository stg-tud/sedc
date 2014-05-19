#include <vector>
#include <set>
#include <functional>
#include <iostream>
#include <cstdlib>
#include <ctime>

using namespace std;

/*trait Mutable[-C[_]] {
	def add[T](collection: C[T], elem: T): Unit
}*/
//arbriraty collection type C with elements T and an arbiraty number additional type parameters (e.g. Allocator or Comparator)
template <template<typename, typename...> class C, typename T, typename... Additional> 
struct Mutable {
	//may contain default implementation, as of now it throws an error when Mutable is not specialized for the specific collection
};

/*implicit object MutableVector extends Mutable[Vector] {
	def add[T](collection: Set[T], elem: T) {
		collection += elem
	}
}*/
template <typename T, typename... Additional>
struct Mutable<vector, T, Additional...> {
	static void add(vector<T, Additional...>& coll, T const& elem) {
		coll.push_back(elem);
	}
};

//same thing for std::set
template <typename T, typename... Additional>
struct Mutable<set, T, Additional...> {
	static void add(set<T, Additional...>& coll, T const& elem) {
		coll.insert(elem); //set uses insert instead of push_back
	}
};

/*
def repeatWithContextBound[T, X[T] <: AnyRef: Mutable](times: Int)(f: => T)(collection: X[T]): collection.type = {
	var i = 0
	while(i < times) {
		implicitly[Mutable[X]].add(collection, f)
		i+= 1
	}
	collection
}
*/
template <typename F, template<typename, typename...> class C, typename T, typename... Additional>
C<T, Additional...> repeat(int times, C<T, Additional...>& coll, F const& f) {
	for(int i = 0; i < times; ++i) {
		Mutable<C, T, Additional...>::add(coll, f());
	}
	return coll;
}

int main() {
	srand(time(nullptr));

	cout << "for a vector" << endl;
	vector<int> vi;
	repeat(3, vi, []{return rand()%10;});

	for(int i : vi) {
		cout << i << endl;
	}

	//analogous
	cout << "for a set" << endl;
	set<int> si;
	repeat(3, si, []{return rand()%10;});
	for(int i : si) {
		cout << i << endl;
	}
}

