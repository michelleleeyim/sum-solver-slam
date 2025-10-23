import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DrillRunner from "./pages/DrillRunner";
import Summary from "./pages/Summary";
import ThreeSumRunner from "./pages/ThreeSumRunner";
import ThreeSumSummary from "./pages/ThreeSumSummary";
import ContainerRunner from "./pages/ContainerRunner";
import ContainerSummary from "./pages/ContainerSummary";
import PalindromeRunner from "./pages/PalindromeRunner";
import PalindromeSummary from "./pages/PalindromeSummary";
import ValidAnagramRunner from "./pages/ValidAnagramRunner";
import ValidAnagramSummary from "./pages/ValidAnagramSummary";
import GroupAnagramsRunner from "./pages/GroupAnagramsRunner";
import ContainsDuplicateRunner from "./pages/ContainsDuplicateRunner";
import TwoSumRunner from "./pages/TwoSumRunner";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/drill/two-pointers" element={<DrillRunner />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/drill/three-sum" element={<ThreeSumRunner />} />
          <Route path="/summary/three-sum" element={<ThreeSumSummary />} />
          <Route path="/drill/container" element={<ContainerRunner />} />
          <Route path="/summary/container" element={<ContainerSummary />} />
          <Route path="/drill/palindrome" element={<PalindromeRunner />} />
          <Route path="/summary/palindrome" element={<PalindromeSummary />} />
        <Route path="/drill/valid-anagram" element={<ValidAnagramRunner />} />
        <Route path="/summary/valid-anagram" element={<ValidAnagramSummary />} />
        <Route path="/drill/group-anagrams" element={<GroupAnagramsRunner />} />
          <Route path="/drill/contains-duplicate" element={<ContainsDuplicateRunner />} />
          <Route path="/drill/two-sum" element={<TwoSumRunner />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
