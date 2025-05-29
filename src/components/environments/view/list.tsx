import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Environment } from "@/types/environments"

import { data } from "@/components/environments/data"

interface EnvironmentsListProps {
  onViewDetails: (environment: Environment) => void
}

export default function EnvironmentsList({
  onViewDetails,
}: EnvironmentsListProps) {
  return (
    <div className="flex flex-grow flex-col justify-between px-4">
      <Table>
        <TableHeader>
          <TableRow className="pointer-events-none">
            <TableHead className="w-48">Name</TableHead>
            <TableHead className="w-12">Code</TableHead>
            <TableHead className="w-32">Isolation Strategy</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((env) => (
            <TableRow
              key={env.id}
              onClick={() => onViewDetails(env)}
              className="cursor-pointer"
            >
              <TableCell className="font-medium">{env.name}</TableCell>
              <TableCell>{env.code}</TableCell>
              <TableCell>{env.isolationStrategy}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
