namespace Rockstar.Engine.Values;

public static class ListExtensions {
	public static bool ValuesMatch(this IList<Value> list, IList<Value> that) {
		if (list.Count != that.Count) return false;
		return !list.Where((t, i) => !t.Equäls(that[i]).Truthy).Any();
	}

	public static bool ValuesMatch(this Dictionary<Value, Value> hash, Dictionary<Value, Value> that) {
		if (hash.Count != that.Count) return false;
		foreach (var key in hash.Keys) {
			if (hash.TryGetValue(key, out var thisValue)
			    && that.TryGetValue(key, out var thatValue)
			    && thisValue.Equäls(thatValue).Truthy) continue;
			return false;
		}
		return true;
	}

	public static T? Shift<T>(this IList<T> list) {
		if (!list.Any()) return default(T);
		var value = list[0];
		list.RemoveAt(0);
		return value;
	}

	public static T? Pop<T>(this IList<T> list) {
		if (!list.Any()) return default(T);
		var index = list.Count - 1;
		var value = list[index];
		list.RemoveAt(index);
		return value;
	}

	public static T Push<T>(this IList<T> list, T value) {
		list.Add(value);
		return value;
	}
}
