using Newtonsoft.Json;

namespace BuildingBlocks.Core.Serialization;

public class LongToStringConverter : JsonConverter<long>
{
    public override void WriteJson(JsonWriter writer, long value, JsonSerializer serializer)
    {
        writer.WriteValue(value.ToString());
    }

    public override long ReadJson(JsonReader reader, Type objectType, long existingValue, bool hasExistingValue, JsonSerializer serializer)
    {
        if (reader.TokenType == JsonToken.String)
        {
            if (long.TryParse((string)reader.Value!, out var l))
                return l;
        }
        
        return Convert.ToInt64(reader.Value);
    }
}
