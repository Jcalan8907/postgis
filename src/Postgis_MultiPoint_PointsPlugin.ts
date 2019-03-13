import { Plugin } from "graphile-build";
import { SUBTYPE_BY_PG_GEOMETRY_TYPE } from "./constants";

const plugin: Plugin = builder => {
  builder.hook("GraphQLObjectType:fields", (fields, build, context) => {
    const {
      scope: { isPgGISGeographyType, pgGISSubtype },
    } = context;
    if (
      !isPgGISGeographyType ||
      pgGISSubtype !== SUBTYPE_BY_PG_GEOMETRY_TYPE.MULTIPOINT
    ) {
      return fields;
    }
    const {
      extend,
      getPostgisTypeByGeometryType,
      graphql: { GraphQLList },
    } = build;
    const Point = getPostgisTypeByGeometryType(
      SUBTYPE_BY_PG_GEOMETRY_TYPE.POINT
    );

    return extend(fields, {
      points: {
        type: new GraphQLList(Point),
        resolve(data: any) {
          return data.__geojson.coordinates.map((coord: any) => ({
            __gisType: SUBTYPE_BY_PG_GEOMETRY_TYPE.POINT,
            __geojson: {
              type: "Point",
              coordinates: coord,
            },
          }));
        },
      },
    });
  });
};
export default plugin;