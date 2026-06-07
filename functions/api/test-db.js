export async function onRequestGet(context) {
  try {
    const result = await context.env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name"
    ).all();

    return Response.json({
      success: true,
      tables: result.results
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Database connection failed"
      },
      { status: 500 }
    );
  }
}