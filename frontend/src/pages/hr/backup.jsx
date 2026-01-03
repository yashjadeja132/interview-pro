import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";

export default function TestResultsTable() {
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("http://localhost:5000/api/test", {
        params: { page, limit, search },
      });
      setResults(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [page, search]);

  return (
    <Card className="p-6">
      <div className="flex justify-between mb-4">
        <Input
          placeholder="Search candidate or position..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="w-64"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Candidate</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Video</TableHead>
            <TableHead>Time Taken</TableHead>
            <TableHead>Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                Loading...
              </TableCell>
            </TableRow>
          ) : results.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                No results found
              </TableCell>
            </TableRow>
          ) : (
            results.map((r, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <div>
                    <div className="font-semibold">{r.candidateName}</div>
                    <div className="text-sm text-gray-500">{r.candidateEmail}</div>
                  </div>
                </TableCell>
                <TableCell>{r.positionName}</TableCell>
                <TableCell>
                  <video width="120" height="80" controls>
                    <source src={r.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </TableCell>
                <TableCell>{r.timeTakenFormatted}</TableCell>
                <TableCell>{r.score}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
          Next
        </Button>
      </div>
    </Card>
  );
}
